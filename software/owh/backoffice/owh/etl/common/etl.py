import yaml
import logging
import datetime
import logging.config
import os
import boto

logging.config.fileConfig(os.path.join(os.path.dirname(__file__),'logging.conf'))

from owh.etl.common.elasticsearch_repository import ElasticSearchRepository
from owh.etl.common.repositories import BatchRepository

logger = logging.getLogger('etl')

class ETLMetrics:
    def __init__(self):
        self.status = None
        self.startTime  = 0
        self.endTime  = 0
        self.duration = 0
        self.insertCount = 0
        self.updateCount=0
        self.deleteCount=0
        self.message=None

class ETL :
    """Base ETL implemetation class that provides the common framework for the ETL implementation.
       All dataset specific ETL implementation class should extend from this class and implement the following abstract methods
        perform_etl() - dataset specific ETL implementation
        validate_etl() - validation of a completed ETL
       The contrete ETL implemetation should also instatiate the ETL impl and invoke the execute() method to
       trigger the execution of the ETL
    """
    def __init__(self, configFile):
        """Initialize the ETL"""
        self.metrics = ETLMetrics()
        self.config = yaml.safe_load(configFile)
        logger.debug("Loaded configuration: %s", yaml.dump(self.config))
        if 'elastic_search' in self.config and 'bulk_load_size' in self.config['elastic_search']:
            self.esRepository = ElasticSearchRepository(self.config['elastic_search'])
            self.batchRepository = BatchRepository(self.config['elastic_search']['bulk_load_size'], self.esRepository)
        else:
            raise ValueError("Elastic search configuration not specified", yaml.dump(self.config))

    def get_record_count(self):
        """Gets the total number records of the type loaded by the ETL"""
        return self.esRepository.count_records()

    def get_record_by_id(self, id):
        """Retrieve a record with the specified id from the index user by the ETL"""
        return self.esRepository.get_record_by_id(id)

    def _create_data_dir(self):
        """Create work directory and set the dataDirectory property"""
        self.dataDirectory = 'WORK/' + datetime.datetime.now().strftime('%Y%m%d.%H%M%S')+'/'
        if not os.path.exists(self.dataDirectory):
            os.makedirs(self.dataDirectory)

    def retrieve_data_files(self):
        """Retrieve data files from AWS bucket"""
        logger.info("Retrieving data files")
        self._create_data_dir()
        if not (self.config['data_file'] and 'aws_access_key_id' in self.config['data_file'] and 'aws_secret_access_key' in self.config['data_file']
                     and 'aws_s3_bucket_name' in self.config['data_file'] and 'aws_s3_directory' in self.config['data_file']):
            raise ValueError ("AWS S3 configuration not provided", yaml.dump(self.config))

        # connect to the bucket
        conn = boto.connect_s3(self.config['data_file']['aws_access_key_id'],self.config['data_file']['aws_secret_access_key'])
        bucket = conn.get_bucket(self.config['data_file']['aws_s3_bucket_name'])

        # dowload the files
        bucket_list = bucket.list()
        awsDataDirectory=self.config['data_file']['aws_s3_directory']
        if not awsDataDirectory.endswith('/'):
            awsDataDirectory += '/'
        for file in bucket_list:
            remotePath = str(file.key)
            if remotePath.startswith(awsDataDirectory):
                logger.debug("Processing remote file: %s", remotePath)
                remoteStrippedPath = remotePath.replace(awsDataDirectory, '', 1)
                localPath = self.dataDirectory + remoteStrippedPath
                localDir = os.path.dirname(localPath)
                if remoteStrippedPath:
                    if remoteStrippedPath.endswith('/'):
                        if not os.path.exists(localDir):
                            os.makedirs(localDir)
                    else:
                        logger.debug("Downloading file remote file '%s' to '%s'", remotePath, localPath)
                        file.get_contents_to_filename(localPath)

    def _print_metrics(self):
        """Print the metrics of the ETL"""
        logger.info("""
        Stauts : %s
        Message: %s
        Start time: %s
        End Time: %s
        Duration: %s
        Insert Count: %s
        Update Count: %s
        Delete Count: %s
        """, self.metrics.status,self.metrics.message, self.metrics.startTime, self.metrics.endTime, self.metrics.duration,self.metrics.insertCount, self.metrics.updateCount, self.metrics.deleteCount)

    def perform_etl(self):
        """ This abstract method must be implemented by the concrete subclasses to perform the ETL specific to the dataset"""
        raise NotImplementedError("ETL.performETL must be implemented by dataset specific ETL subclass")

    def validate_etl(self):
        """ This abstract method must be implemented by concrete ETL class implemenation specific to the dataset.
         Implementation of the this method should perform some validation of the data loaded.
         Some proposed validations are
            1. Validate the counts of recods created/updated/deleted
            2. Validation of a random record by checking that all mandatory attributes are set have valid values in the expected range
        """
        raise NotImplementedError("ETL.valuidateETL must be implemented by dataset specific ETL subclass")

    def execute(self):
        """Execute the ETL process"""
        try:
            self.metrics.startTime = datetime.datetime.now()
            logger.info("Starting ETL")
            if  not ('local_directory' in self.config['data_file'] and self.config['data_file']['local_directory']):
                logger.info("Retriving input data files for ETL from AWS S3 bucket specified")
                self.retrieve_data_files()
                logger.info("Data files retreival complete")
            else:
                self.dataDirectory = self.config['data_file']['local_directory']
                logger.info("Using local directory %s for data files, skipping data files retrieval from AWS S3", self.config['data_file']['local_directory'])
            logger.info("Starting transfromation and load")
            self.perform_etl()
            logger.info("Transfromation and Load completed")
            logger.info("Validating ETL")
            if not self.validate_etl():
                self.metrics.status='FAILED'
                logger.error("ETL validation FIALED, below is the metrics from the ETL")
            else:
                self.metrics.status = "SUCCESS"
                logger.info("ETL completed successfully, below is the metrics from the ETL")
            self.metrics.endTime = datetime.datetime.now()
            self.metrics.duration = self.metrics.endTime - self.metrics.startTime
            self._print_metrics()
        except Exception as e:
            logger.fatal("Exception running ETL: %s", e)
            logger.fatal(e)
            self.metrics.status = "ERROR"
            self.metrics.message = "Exception running ETL: %s" % e
            raise