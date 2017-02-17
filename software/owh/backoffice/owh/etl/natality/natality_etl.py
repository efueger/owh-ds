import os
from owh.etl.common.etl import ETL
import logging
from owh.etl.common.fixedwidthfile_parser import FixedWidthFileParser
logger = logging.getLogger('natality_etl')

class NatalityETL (ETL):
    """
        Loads Natality data into ES db
    """
    def __init__(self, configFile):
        ETL.__init__(self, configFile)
        self.create_index(os.path.join(os.path.dirname(__file__), "es_mapping"
                             ,self.config['elastic_search']['type_mapping']), True)

    def perform_etl(self):
        """Load the Natality data"""
        record_count = 0
        self.initialCount = self.get_record_count()

        for f in os.listdir(self.dataDirectory):
            if not f.endswith(".dat"):
                continue
            file_path = os.path.join(self.dataDirectory, f)
            logger.info("Processing file: %s", f)
            #extract the year from file name
            year = int(f[3:7])
            if year >= 2000 and year <= 2002:  # for year 2000 to 2002
                config_file = os.path.join(self.dataDirectory, 'data_mapping', 'nat_2000_2002.json')
            elif year == 2003 or year == 2004:   # for year 2003 & 2004
                config_file =  os.path.join(self.dataDirectory, 'data_mapping', 'nat_2003_2004.json')
            elif year == 2005 or year == 2006:   # for year 2005 & 2006
                config_file =  os.path.join(self.dataDirectory, 'data_mapping', 'nat_2005_2006.json')
            elif year >= 2007 and year <= 2013:  # data file for year 2007 to 2013
                config_file =  os.path.join(self.dataDirectory, 'data_mapping', 'nat_2007_2013.json')
            elif year == 2014: # for year 2014
                config_file =  os.path.join(self.dataDirectory, 'data_mapping', 'nat_2014.json')
            else:
                logger.warn("No mapping available for data file %s, skipping", file_path)
                continue
            self.loadDataSetMetaData('deaths', str(year), config_file)
            natality_parser = FixedWidthFileParser(file_path, config_file)
            while True:
                record  = natality_parser.parseNextLine()
                if not record:
                    break
                record_count += 1
                self.batchRepository.persist({"index": {"_index": self.config['elastic_search']['index'],
                                                        "_type": self.config['elastic_search']['type'],
                                                        "_id": record_count}})
                self.batchRepository.persist(record)

            self.batchRepository.flush()
            self.refresh_index()
        self.metrics.insertCount = record_count
        logger.info("*** Processed %s records from all natality data files", self.metrics.insertCount)


    def validate_etl(self):
        """ Validate the ETL"""
        expectedCount = (self.initialCount + self.metrics.insertCount)
        if expectedCount != self.get_record_count():
            self.metrics.message = "Number of records in the DB (%d) not same as the number of records expected (%d)" % (self.get_record_count(), expectedCount)
            return False
        if self.get_record_by_id(1) is None:
            self.metrics.message = "Record 1 is None"
            return False
        if self.get_record_by_id(self.get_record_count()) is None:
            self.metrics.message = "Last record is None"
            return False
        return True


if __name__ == "__main__":
    # Perform ETL
    etl = NatalityETL(file(os.path.join(os.path.dirname(__file__), "config.yaml"), 'r'))
    etl.execute()
