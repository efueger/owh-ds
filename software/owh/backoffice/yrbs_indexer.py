import os
import csv
import json
from elasticsearch_repository import ElasticSearchRepository
from repositories import BatchRepository


INPUT_FILES_DIR = 'C:/Users/Ashok/Desktop/OWH/YRBS/two_entity_csvs_all_years/final_files'

configs = {}
ES_HOST = '192.168.2.21'#'search-spl-neoxainmajvric7meirttqquqy.us-east-1.es.amazonaws.com' #'search-spl-neoxainmajvric7meirttqquqy.us-east-1.es.amazonaws.com'
ES_PORT = 9200 #update port if it is running on different port

ES_BULK_LOAD_SIZE = 50
ES_YRBS_INDEX = 'yrbs_all'
ES_YRBS_TYPE = 'yrbs'


yrbs_es_repo = ElasticSearchRepository(ES_HOST, ES_PORT, ES_YRBS_INDEX, ES_YRBS_TYPE)
yrbs_batch_repo = BatchRepository(ES_BULK_LOAD_SIZE, yrbs_es_repo)

column_hash = {'race':[
            {"null": ["question","percent", "lower_confidence", "upper_confidence", "count"]},
            {"ai_an": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"asian": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"black_african_american": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"hispanic": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"nhopi": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"white": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"multiple_race": ["percent", "lower_confidence", "upper_confidence", "count"]}
        ],
        "sex":[
              {"null": ["question", "percent", "lower_confidence", "upper_confidence", "count"]},
              {"female": ["percent", "lower_confidence", "upper_confidence", "count"]},
              {"male": ["percent", "lower_confidence", "upper_confidence", "count"]}
        ],
        "grade": [
            {"null": ["question", "percent", "lower_confidence", "upper_confidence", "count"]},
            {"8th": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"10th": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"11th": ["percent", "lower_confidence", "upper_confidence", "count"]},
            {"12th": ["percent", "lower_confidence", "upper_confidence", "count"]}
        ],
        "total":[

        ]
}

races_key_map = {"all-races-ethnicities":"all-races-ethnicities", "american-indian-or-alaska-native":"ai_an", "asian":"asian",
           "black-or-african-american":"black_african_american", "hispanic-or-latino":"hispanic", "multiple-race":"multiple_race",
           "native-hawaiian-or-other-pacific-islander":"nhopi", "white":"white"}

questions_mappings = {}
categories_mappings= []

class YrbsIndexer:

    def get_column_maps(self, data_type):
        return column_hash[data_type]

    def getQueryAttributesForYrbsFile(self, fileName):
        nameParts = fileName.split("_")
        if nameParts[2] == 'race':
            return {"year": nameParts[1], "primary_filter":"race", "sex": nameParts[3], "race": races_key_map['all-races-ethnicities'], "grade": nameParts[4]}
        elif nameParts[2] == 'grade':
            return {"year":nameParts[1], "primary_filter":"grade", "sex": nameParts[3], "race": races_key_map[nameParts[4]], "grade": 'all'}
        elif nameParts[2] == 'sex':
            return {"year":nameParts[1], "primary_filter":"sex", "sex": 'both', "race": races_key_map[nameParts[3]], "grade": nameParts[4]}

    def strip_foreign_chars(self, str):
        if str.__contains__('\xa0'):
            str = str.replace('\xa0', '')
        if str.__contains__('\x86'):
            str = str.replace('\x86', '')
        if str.__contains__('\x87'):
            str = str.replace('\x87', '')
        if str.__contains__('\xca'):
            str = str.replace('\xca', '')
        return str.strip()

    def index_yrbs_data(self):
        counter = 0
        for f in os.listdir(INPUT_FILES_DIR):
            if not f.endswith(".csv"):
                continue
            fileName = os.path.splitext(f)[0]
            print 'processing file:', fileName
            query_attributes = self.getQueryAttributesForYrbsFile(fileName)
            fileType = fileName.split('_')[2]
            column_maps = self.get_column_maps(fileType)

            file = "%s/%s" % (INPUT_FILES_DIR, f)
            with open(file, 'rU') as csv_file:
                csv_reader = csv.reader(csv_file, delimiter=',', quotechar='"')
                line_index = 0
                data = []
                question_category = ''
                for line in csv_reader:
                    if line_index <= 1:
                        line_index += 1
                        continue
                    question = {}
                    if line:
                        if categories_mappings.__contains__(line[0].strip()) and line[1].strip() == '':
                            question_category = self.strip_foreign_chars(line[0])
                        elif question_category:
                            word_index = 0
                            doc = {}
                            for column_map in column_maps:
                                inner_object = {}
                                for key in column_map:
                                    column_values = column_map[key]
                                    for colum in column_values:
                                        value = self.strip_foreign_chars(line[word_index])
                                        if key != 'null':
                                            if colum == 'count':
                                                inner_object["" + colum] = value.replace(',', '')
                                            else:
                                                inner_object["" + colum] = value
                                        else:
                                            if colum == 'count':
                                                doc["" + colum] = value.replace(',', '')
                                            elif colum == 'question':
                                                question['category'] = question_category
                                                question['label'] = value
                                                print question_category
                                                question.update(questions_mappings[value])
                                                doc["" + colum] = question
                                            else:
                                                doc["" + colum] = value
                                        word_index += 1
                                if inner_object:
                                    doc["" + key] = inner_object
                            #data.append(data_part)
                            counter += 1
                            print "counter:", counter
                            doc.update(query_attributes)
                            yrbs_batch_repo.persist({"index": {"_index": ES_YRBS_INDEX, "_type": ES_YRBS_TYPE, "_id": counter}})
                            yrbs_batch_repo.persist(doc)
                            yrbs_batch_repo.flush()
                    else:
                        print "Empty line"

    def create_index(self, recreate_index):
        if recreate_index:
            with open('./elastic_mappings/yrbs-type-mapping.json', "r") as mapping:
                yrbs_es_repo.recreate_index(json.load(mapping))
        else:
            with open('./elastic_mappings/yrbs-type-mapping.json', "r") as mapping:
                yrbs_es_repo.create_mappings(json.load(mapping))

    def load_questions_mappings(self):
        with open('./data_mapping/questions-mappings.json', "r") as mapping:
            global questions_mappings
            global categories_mappings
            mappings = json.load(mapping, encoding="utf8")
            questions_mappings = mappings['questions']
            categories_mappings = mappings['categories']

indexer  = YrbsIndexer()
indexer.load_questions_mappings()
indexer.create_index(True)
indexer.index_yrbs_data()