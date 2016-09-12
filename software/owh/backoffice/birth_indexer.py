import json
import os



INPUT_FOLDER ="./input"
OUTPUT_FOLDER ="./output"

configs = {}
records = []

class BirthParser:
    '''
       Parse the birth text file and convert it into json
    '''

    def read_config_json_file(self):
        with open("%s/%s" % (INPUT_FOLDER, "final-json-file.json")) as jf:
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

    def get_value(self, value):
        if value:
            return value.strip()
        else:
            "None"

    def export_data_to_file(self, file_name):
        with open(file_name, 'w') as outfile:
            json.dump(records, outfile)

    def get_date_of_birth(self, row):
        dob = ""
        if (row["birth_month"]):
            dob = row["birth_month"] + "-"
        if (row["birth_year"]):
            dob += row["birth_year"]
        return dob

    def generate_birth_json_from_text_file(self):
        counter = 0
        for f in os.listdir(INPUT_FOLDER):
            if not f.endswith(".txt"):
                continue
            file_path = "%s/%s" % (INPUT_FOLDER, f)
            print "Processing file : ", f
            with open(file_path) as infile:
                for line in infile:
                    row = {}
                    counter += 1
                    for config in configs:
                        record = {}
                        start = config['start']
                        stop = config['stop']
                        value = line[start - 1:stop]
                        if value.strip() == '': #check for blank
                            value = '-9'
                        elif config.get('type'): #check for range values
                            value = self.get_range_value(value, config['mappings'])
                        row[config['column']] = self.get_value(value)
                    row["date_of_birth"] = self.get_date_of_birth(row)
                    print "counter", counter
                    records.append(row)

            json_file = "%s/%s" % (OUTPUT_FOLDER, f.replace(".txt", ".json"))
            self.export_data_to_file(json_file)
