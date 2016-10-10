import json
import os
from random import randint

from elasticsearch_repository import ElasticSearchRepository
from repositories import BatchRepository

INPUT_FILE_LOCATION = "C:\PRJ\OWH\datasets\mortaliy"

CONFIG_FILE_DIR = './data_mapping'

configs = {}
records = []
icd_10_code_mappings = {}

ES_HOST = '127.0.0.1' #'search-spl-neoxainmajvric7meirttqquqy.us-east-1.es.amazonaws.com' #'search-spl-neoxainmajvric7meirttqquqy.us-east-1.es.amazonaws.com'
ES_PORT = 9200 #update port if it is running on different port

ES_BULK_LOAD_SIZE = 5000
ES_MORTALITY_INDEX = 'owh'
ES_MORTALITY_TYPE = 'mortality'

ES_BIRTH_MAPPING_JSON = './elastic_mappings/mortality-type-mapping.json'

birth_es_repo = ElasticSearchRepository(ES_HOST, ES_PORT, ES_MORTALITY_INDEX, ES_MORTALITY_TYPE)
birth_batch_repo = BatchRepository(ES_BULK_LOAD_SIZE, birth_es_repo)

counter = 0
us_states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
             "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
             "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

class MortalityIndexer:

    def load_icd_code_mappings(self):
        print 'Loading icd config file'
        with open("./elastic_mappings/conditions-ICD-10-mappings.json") as jf:
            global icd_10_code_mappings
            icd_10_code_mappings = json.load(jf, encoding="utf8")

    def createIndex(self, recreate_index):
        if recreate_index:
            with open(ES_BIRTH_MAPPING_JSON, "r") as mapping:
                birth_es_repo.recreate_index(json.load(mapping))
        else:
            with open(ES_BIRTH_MAPPING_JSON, "r") as mapping:
                birth_es_repo.create_mappings(json.load(mapping))

    def load_config_json_file(self, file_name):
        print 'Loading config file:', file_name
        with open("%s/%s" % (CONFIG_FILE_DIR, file_name)) as jf:
            global configs
            configs = json.load(jf, encoding="utf8")

    def parse_value(self, value):
        if not value.isdigit():
            return value
        if "." in value:
            return float(value)
        return int(value)

    def get_range_value(self, value, mappings):
        if mappings.get(value):
            return value
        else:
            for key in mappings.keys():
                if "-" in key:
                    ranges = key.split("-")
                    if self.parse_value(value) >= self.parse_value(ranges[0]) \
                            and self.parse_value(value) <= self.parse_value(ranges[1]):
                        return key

    def checkBlanks(self, value):
        if value == '':  # check for blank
            value = '_BLANK_'
        return value

    def index_mortality_data(self):
        for f in os.listdir(INPUT_FILE_LOCATION):
            if not f.endswith(".DUSMCPUB"):
                continue
            file_path = "%s/%s" % (INPUT_FILE_LOCATION, f)
            print "Processing file : ", f
            config_file =  f.replace(".DUSMCPUB", ".json")
            self.load_config_json_file(config_file)

            print 'Loading config file for:', f

            with open(file_path) as infile:
                for line in infile:
                    row = {}
                    global counter
                    counter += 1
                    i = 0
                    #iterate over each config mapping
                    while i < configs.__len__():
                        config = configs[i]
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
                                conditionConfig = configs[conditionIndex]
                                start = conditionConfig['start']
                                stop = conditionConfig['stop']
                                condition = line[start - 1:stop].strip()
                                conditions.append(condition)
                                conditionIndex += 1

                            row[config['column'][:-6]] = conditions
                            i += 21
                        elif config.get('type'):  # check for range values
                            value = self.get_range_value(value, config['mappings'])
                            row[config['column']] = self.checkBlanks(value)
                            i += 1
                        elif config['column'] == 'ICD_10_code':
                            code = value.upper()
                            if code:
                                row[config['column']] = {'code': code, 'path':icd_10_code_mappings[code]}
                            else:
                                row[config['column']] = self.checkBlanks(value.upper())
                            i += 1
                        else:
                            row[config['column']] = self.checkBlanks(value.upper())
                            i += 1

                    print "Record count:", counter
                    row['state'] = us_states[randint(0,49)]
                    birth_batch_repo.persist({"index": {"_index": ES_MORTALITY_INDEX, "_type": ES_MORTALITY_TYPE, "_id": counter}})
                    birth_batch_repo.persist(row)
            infile.close()


indexer = MortalityIndexer()
indexer.createIndex(True)
indexer.load_icd_code_mappings()
indexer.index_mortality_data()