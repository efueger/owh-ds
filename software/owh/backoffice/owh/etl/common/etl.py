import yaml
import logging

from owh.etl.common.elasticsearch_repository import ElasticSearchRepository
from owh.etl.common.repositories import BatchRepository

logger = logging.getLogger('etl')



class ETL :
    def __init__(self, configFile):
        """Initialize the ETL"""
        self.config = yaml.safe_load(configFile)
        logger.debug("Loaded configuration:", yaml.dump(self.config))
        if 'elastic_search' in self.config and 'bulk_load_size' in self.config['elastic_search']:
            self.esRepository = ElasticSearchRepository(self.config['elastic_search'])
            self.batchRepository = BatchRepository(self.config['elastic_search'], self.esRepository)
        else:
            raise ValueError ("Elastic search configuration not specified", yaml.dump(self.config))

    def retrieveDataFiles():
        print "Retrieve files"

