import json
import os
from random import randint
from owh.etl.common.etl import ETL
import logging

logger = logging.getLogger('mortality_etl')

counter = 0
us_states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
             "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
             "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

class MortalityIndexer (ETL):

    def __init__(self, configFile):
        ETL.__init__(self, configFile)
        self._create_index(True)
        self._load_icd_code_mappings()


    def _load_icd_code_mappings(self):
        with open(os.path.join(os.path.dirname(__file__),"es_mapping/conditions-ICD-10-mappings.json")) as jf:
            self.icd_10_code_mappings = json.load(jf, encoding="utf8")

    def _create_index(self, recreate_index):
        mappingFile = os.path.join(os.path.dirname(__file__), "es_mapping"
                                                    ,self.config['elastic_search']['type_mapping'])
        if recreate_index:
            with open(mappingFile, "r") as mapping:
                self.esRepository.recreate_index(json.load(mapping))
        else:
            with open(mappingFile, "r") as mapping:
                self.esRepository.create_mappings(json.load(mapping))

    def _load_config_json_file(self, file_name):
        print 'Loading config file:', file_name
        with open(os.path.join(self.dataDirectory, 'data_mapping',file_name)) as jf:
            self.configs = json.load(jf, encoding="utf8")

    def _parse_value(self, value):
        if not value.isdigit():
            return value
        if "." in value:
            return float(value)
        return int(value)

    def _get_range_value(self, value, mappings):
        if mappings.get(value):
            return value
        else:
            for key in mappings.keys():
                if "-" in key:
                    ranges = key.split("-")
                    if self._parse_value(value) >= self._parse_value(ranges[0]) \
                            and self._parse_value(value) <= self._parse_value(ranges[1]):
                        return key
    def _check_blanks(self, value):
        if value == '':  # check for blank
            value = '_BLANK_'
        return value

    def perform_etl(self):
        """Perform the mortality ETL"""

        for f in os.listdir(self.dataDirectory):
            if not f.endswith(".DUSMCPUB"):
                continue
            file_path = os.path.join(self.dataDirectory, f)
            logger.info("Processing file: %s", f)
            config_file =  f.replace(".DUSMCPUB", ".json")
            self._load_config_json_file(config_file)
            logger.debug('Loading config file for: %s', f)
            with open(file_path) as infile:
                for line in infile:
                    row = {}
                    global counter
                    counter += 1
                    i = 0
                    #iterate over each config mapping
                    while i < self.configs.__len__():
                        config = self.configs[i]
                        start = config['start']
                        stop = config['stop']
                        value = line[start - 1:stop].strip()
                        #if this field is condition field, we have to capture all conditions(cound be 20) in single field
                        if (config['column'] == 'entity_axis_condn_count' or config['column'] == 'record_axis_condn_count'):

                            numberOfCond = int(value)
                            # store number of conditions
                            row[config['column']] = numberOfCond

                            conditions = []
                            conditionIndex = i + 1
                            #get all the conditions
                            for j in range(0, numberOfCond):
                                conditionConfig = self.configs[conditionIndex]
                                start = conditionConfig['start']
                                stop = conditionConfig['stop']
                                condition = line[start - 1:stop].strip()
                                conditions.append(condition)
                                conditionIndex += 1

                            row[config['column'][:-6]] = conditions
                            i += 21
                        elif config.get('type'):  # check for range values
                            value = self._get_range_value(value, config['mappings'])
                            row[config['column']] = self._check_blanks(value)
                            i += 1
                        elif config['column'] == 'ICD_10_code':
                            code = value.upper()
                            if code:
                                row[config['column']] = {'code': code, 'path':self.icd_10_code_mappings[code]}
                            else:
                                row[config['column']] = self._check_blanks(value.upper())
                            i += 1
                        else:
                            row[config['column']] = self._check_blanks(value.upper())
                            i += 1

                    logger.debug("Record count: %s", counter)
                    row['state'] = us_states[randint(0,49)]
                    self.batchRepository.persist({"index": {"_index": self.config['elastic_search']['index'], "_type": self.config['elastic_search']['type'], "_id": counter}})
                    self.batchRepository.persist(row)
            infile.close()
            self.batchRepository.flush()
        self.metrics.insertCount=counter

    def validate_etl(self):
        """ Validate the ETL"""
        if self.metrics.insertCount != self.get_record_count():
            self.metrics.message = "Number of records in the DB (%d) not same as the number of records inserted (%d)" % (self.get_record_count(), self.metrics.insertCount)
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
    indexer = MortalityIndexer(file(os.path.join(os.path.dirname(__file__), "config.yaml"), 'r'))
    indexer.execute()
