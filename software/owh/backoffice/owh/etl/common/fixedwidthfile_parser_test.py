import unittest
import os
from owh.etl.common.fixedwidthfile_parser import FixedWidthFileParser

class TestFixedWithFileParser(unittest.TestCase):

    def setUp(self):
        datafile = os.path.join(os.path.dirname(__file__),'testdata/testdata.txt')
        datamapping =  os.path.join(os.path.dirname(__file__),'testdata/mapping.json')
        self.fwfParser = FixedWidthFileParser(datafile, datamapping)

    def test_simple(self):
        data = self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)
        self.assertEqual(data[0]['st_fips'], "01")
        self.assertEqual(data[0]['age'], "25-29years")
        self.assertEqual(data[0]['race'], "1")
        self.assertEqual(data[0]['sex'], "M")
        self.assertEqual(data[0]['hispanic_origin'], "1")
        self.assertEqual(data[0]['pop'], "325")
        self.assertEqual(data[0]['year'], "2010")

        self.assertEqual(data[1]['st_fips'], "01")
        self.assertEqual(data[1]['age'], "25-29years")
        self.assertEqual(data[1]['race'], "1")
        self.assertEqual(data[1]['sex'], "M")
        self.assertEqual(data[1]['hispanic_origin'], "1")
        self.assertEqual(data[1]['year'], "2011")
        self.assertEqual(data[1]['pop'], "315")

        self.assertEqual(data[2]['year'], "2012")
        self.assertEqual(data[2]['pop'], "337")
        self.assertEqual(data[3]['year'], "2013")
        self.assertEqual(data[3]['pop'], "304")
        self.assertEqual(data[4]['year'], "2014")
        self.assertEqual(data[4]['pop'], "288")
        self.assertEqual(data[5]['year'], "2015")
        self.assertEqual(data[5]['pop'], "296")

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)

        data =  self.fwfParser.parseNextLine()
        self.assertEqual(len(data), 6)
        # 2015010011711     361     338     292     307     316     339     321
        self.assertEqual(len(data), 6)
        self.assertEqual(data[0]['st_fips'], "01")
        self.assertEqual(data[0]['age'], "55-59years")
        self.assertEqual(data[0]['race'], "1")
        self.assertEqual(data[0]['sex'], "M")
        self.assertEqual(data[0]['hispanic_origin'], "1")
        self.assertEqual(data[0]['pop'], "361")
        self.assertEqual(data[0]['year'], "2010")

        self.assertEqual(data[1]['st_fips'], "01")
        self.assertEqual(data[1]['age'], "55-59years")
        self.assertEqual(data[1]['race'], "1")
        self.assertEqual(data[1]['sex'], "M")
        self.assertEqual(data[1]['hispanic_origin'], "1")
        self.assertEqual(data[1]['year'], "2011")
        self.assertEqual(data[1]['pop'], "292")

        self.assertEqual(data[2]['year'], "2012")
        self.assertEqual(data[2]['pop'], "307")
        self.assertEqual(data[3]['year'], "2013")
        self.assertEqual(data[3]['pop'], "316")
        self.assertEqual(data[4]['year'], "2014")
        self.assertEqual(data[4]['pop'], "339")
        self.assertEqual(data[5]['year'], "2015")
        self.assertEqual(data[5]['pop'], "321")
        data =  self.fwfParser.parseNextLine()
        self.assertEqual(data, None)

if __name__ == '__main__':
    unittest.main()