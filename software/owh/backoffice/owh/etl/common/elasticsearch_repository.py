__author__ = "Biju Joseph"

import logging

import elasticsearch
import elasticsearch.helpers

from repositories import Repository

logger = logging.getLogger('elastic')

INDEX_SETTINGS = {
     "settings": {
        "refresh_interval" : "60s"
     }
}

class ElasticSearchRepository(Repository, object):
    """ A facade that provides functionality to index objects in ElasticSearch
    Attributes:
        host_name: the host name
        port: the port
        doctype: the name of the document type
    """
    def __init__(self, esConfig):
        """ Initializes the repo  """
        if esConfig and 'host' in esConfig and 'port' in esConfig and 'index' in esConfig and 'type' in esConfig :
            self.es = elasticsearch.Elasticsearch([{'host': esConfig['host'], 'port': esConfig['port']}])
            self.index_name = esConfig['index']
            Repository.__init__(self,esConfig['type'])
        else:
            logger.error ("One or more elastic search configuration not specified, unable to initialize elastic search")
            raise ValueError("One or more elastic search configuration not specified")

    def create_mappings(self, mapping):
        """
        Will create the mapping ONLY if the type is not present in the index.
        :param mapping:
        """
        if not self.es.indices.exists_type(index=self.index_name, doc_type=self.name):
            self.es.indices.put_mapping(index=self.index_name, doc_type=self.name, body=mapping)


    def create_index(self, mapping):
        """
        Will create the index
        Args:
            mapping:
        """
        if self.es.indices.exists(self.index_name):
            logging.info('Index %s already exists', self.index_name)
            return

        try:
            # Create the index
            self.es.indices.create(index= self.index_name, body=INDEX_SETTINGS, ignore=400)

            #specify the mapping
            self.create_mappings(mapping)
            self.es.indices.clear_cache(index=self.index_name)
        except Exception as e:
            logging.fatal('Error creating index  [%s] for doctype [%s]', self.index_name, self.name)
            logging.error(e)

            raise

    def delete_index(self):
        """
        Will delete the index
        """
        try:
            self.es.indices.delete(index=self.index_name)
            logging.info('Deleted index %s', self.index_name)
        except elasticsearch.ElasticsearchException:
            logging.info('Unable to delete index %s', self.index_name)

    def recreate_index(self, mappings):
        self.delete_index()
        self.create_index(mappings)

    def load(self, selector):
        """
        Will returnt the document identified by the ID in selector
        """
        return self.es.get(index=self.index_name, doc_type=self.name, id=selector)

    def persist(self, obj):
        """
        Will persist objects into the index
        Args:
            obj: an array of json objects that supports es bulk format

        Returns:
            The elastic search response object
        """
        res = self.es.bulk(index= self.index_name, body= obj, refresh=True, request_timeout = 30)
        print "Flush"
        return res

    def search(self, criteria, sort, pagination):
        return self.es.search(index=self.index_name, body=criteria)

    def countrecords(self):
        return self.es.count(index=self.index_name, doc_type=self.name)['count']