from birth_indexer import BirthParser
from elasticsearch_repository import ElasticSearchRepository
from repositories import BatchRepository

import json
import os

ES_HOST ='192.168.2.21' #use your elasticsearch server ip
ES_PORT = 9200 #update port if it is running on different port

ES_BIRTH_MAPPING_JSON = './elastic_mappings/netality_type-mapping.json'
INPUT_JSON_FOLDER = './output'

ES_BULK_LOAD_SIZE = 500
ES_BIRTH_INDEX = 'owh'
ES_BIRTH_TYPE = 'birth'

birth_es_repo = ElasticSearchRepository(ES_HOST, ES_PORT, ES_BIRTH_INDEX, ES_BIRTH_TYPE)
birth_batch_repo = BatchRepository(ES_BULK_LOAD_SIZE, birth_es_repo)

birth_parser = BirthParser()

def index_birth_json(recreate_index, json_file_name):

    json_file = "%s/%s.%s" % (INPUT_JSON_FOLDER, json_file_name, 'json')
    print "Json file:", json_file

    if not os.path.exists(json_file):
        print 'input file does not exist on file system'
        return

    if recreate_index:
        with open(ES_BIRTH_MAPPING_JSON, "r") as mapping:
            birth_es_repo.recreate_index(json.load(mapping))
    else:
        with open(ES_BIRTH_MAPPING_JSON, "r") as mapping:
            birth_es_repo.create_mappings(json.load(mapping))

    with open("./output/" + json_file_name + ".json", "r") as jf:
        births = json.load(jf)
        counter = 0
        print 'Data indexing started...'
        for birth in births:
            counter += 1
            birth_batch_repo.persist({"index": {"_index": ES_BIRTH_INDEX, "_type": ES_BIRTH_TYPE, "_id": counter}})
            birth_batch_repo.persist(birth)
        print 'Data indexing finished...'
        print 'Number of documents indexed: ', counter
    birth_batch_repo.flush()


birth_parser.read_config_json_file()
birth_parser.generate_birth_json_from_text_file()

index_birth_json(False, 'Nat2014PublicPS.c20150514.r20151007')

