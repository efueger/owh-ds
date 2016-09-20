import yaml
import logging
import datetime

from owh.etl.common.elasticsearch_repository import ElasticSearchRepository
from owh.etl.common.repositories import BatchRepository

logger = logging.getLogger('etl')

class ETLMetrics:
    def __init__(self):
        self.status = ''
        self.startTime  = 0
        self.endTime  = 0
        self.duration = 0
        self.insertCount = 0
        self.udpateCount=0
        self.deletedCount=0

class ETL :
    def __init__(self, configFile):
        """Initialize the ETL"""
        self.metrics = ETLMetrics()
        self.config = yaml.safe_load(configFile)
        logger.debug("Loaded configuration:", yaml.dump(self.config))
        if 'elastic_search' in self.config and 'bulk_load_size' in self.config['elastic_search']:
            self.esRepository = ElasticSearchRepository(self.config['elastic_search'])
            self.batchRepository = BatchRepository(self.config['elastic_search'], self.esRepository)
        else:
            raise ValueError("Elastic search configuration not specified", yaml.dump(self.config))

    def getCurrentRecordCount(self):
        return self.esRepository.countrecords()

    def retrieveDataFiles(self):
        """Retrieve data files from AWS bucket"""
        logger.info("Retrieving data files")

    def printMetrics(self):
        """Print the metrics of the ETL"""
        logger.info("""
        """)

    def performETL(self):
        """ This abstract method must be implemented by the concrete subclasses to perform the ETL specific to the dataset"""
        raise NotImplementedError("ETL.performETL must be implemented by dataset specific ETL subclass")

    def validateETL(self):
        """ This abstract method must be implemented by concrete ETL class implemenation specific to the dataset.
         Implementation of the this method should perform some validation of the data loaded.
         Some proposed validations are
            1. Validate the counts of recods created/updated/deleted
            2. Validation of a random record by checking that all mandatory attributes are set have valid values in the expected range
        """
        raise NotImplementedError("ETL.valuidateETL must be implemented by dataset specific ETL subclass")

    def execute(self):
        """Execute the ETL process"""
        self.metrics.startTime = datetime.datetime.now()
        logger.info("Starting ETL")
        logger.info("Retriving input data files for ETL")
        self.retrieveDataFiles()
        logger.info("Data files retreival complete")
        logger.info("Starting transfromation and load")
        self.performETL()
        logger.info("Transfromation and Load completed")
        logger.info("Validating ETL")
        self.validateETL()
        logger.info("Validation completed")
        logger.info("ETL completed successfully, below is the metrics from the ETL")
        self.metrics.endTime = datetime.datetime.now()
        self.metrics.duration = self.metrics.endTime - self.metrics.startTime
        self.metrics.status = "SUCCESS"
        self.printMetrics()