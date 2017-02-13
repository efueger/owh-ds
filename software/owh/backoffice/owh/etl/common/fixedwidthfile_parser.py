__author__ = "Gopal Unnikrishnan"
import logging
import json

logger = logging.getLogger('fwfparser')

class FixedWidthFileParser:
    """
     Parses a data file that contains data in fixed with columns.
     A datamapping per the syntax defined at https://projects.semanticbits.com/confluence/display/OWH/Data+mapping+file defines the content of the data file and used in the parsing of the data
     Args:
        datafile: path to the data file to be parsed
        datamappingfile: Path to datamapping file in the format specified above
    """
    def __init__(self, datafile, datamappingfile):
        """
        Initializes the parser
        """
        self.datafile = open(datafile)
        with open(datamappingfile) as fmap:
            self.dataconfig = json.load(fmap)

    def parseNextLine(self):
        """
            Read and parse the next non empty line. Empty lines are skipped, so a single parseNextLine could read more
            than one row from the data file if the lines are emtpy

            Returns:
                A dict containg the parsed and processed value, if there are no union type columns in the mapping, a list
                of dict otherwise. The processing depends on the data column type specified in the mapping file.

                If the the data mapping contains union type, then result will contains as many dicts are there are fields.
        """
        hasUnion = False
        result = []
        self.line = self.datafile.readline()
        if self.line == '': # Return None once EOF is reached
            return None
            self.datafile.close()
        elif self.line.strip() == '' : # Skip empty lines
            return self.parseNextLine()
        row = {}
        for config in self.dataconfig :
            if(config['type'] == 'simple'):
                row[config['column']] = self._simple_value(config)
            elif (config['type'] == 'map'):
                row[config['column']] = self._map_value(config)
            elif (config['type'] == 'range'):
                 row[config['column']] = self._get_range_value(config)
            elif (config['type'] == 'list'):
                for field in config['fields']:
                    if field['data_year'] == row['current_year']:
                        if field['type'] == 'map':
                            row[config['column']] = self._map_value(field)
                            break
                        else:
                            row[config['column']] = self._simple_value(field)
                    else:
                        continue
            elif (config['type'] == 'split'):
                for col in config['columns']:
                    value = self._get_value(config['start'], config['stop'])
                    if config['mappings'].has_key(value):
                        row[col] = config['mappings'].get(value).get(col)
                    else:
                        row[col] = None
            elif (config['type'] == 'union'):
                hasUnion = True
                for field in config['fields']:
                    value = self._get_value(field['start'], field['stop'])
                    row[config['column']] = value
                    row[config['index_column']] = field['index_value']
                    result.append(row.copy())
        if ( not hasUnion):
            result = row
        return result

    def _get_value(self, start, stop):
        return  self.line[start - 1:stop].strip()

    def _parse_value(self, value):
        if value is None:
            return value
        elif not value.isdigit():
            return value
        elif "." in value:
            return float(value)
        else:
            return int(value)

    def _simple_value(self, config):
            return self._get_value(config['start'], config['stop'])

    def _map_value(self, config):
        if config['mappings']:
            return config['mappings'].get(self._get_value(config['start'], config['stop']))
        else:
            return None

    def _get_range_value(self, config):
        mappings = config['mappings']
        value = self._get_value(config['start'], config['stop'])
        if config['mappings'].has_key(value):
            return mappings.get(value)
        else:
            for key in mappings.keys():
                if "-" in key:
                    ranges = key.split("-")
                    if self._parse_value(value) >= self._parse_value(ranges[0]) \
                            and self._parse_value(value) <= self._parse_value(ranges[1]):
                        return  mappings.get(key)
            return None





