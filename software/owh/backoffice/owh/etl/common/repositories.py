__author__ = "Biju Joseph"
import logging
import os
import json

logger = logging.getLogger('repo')


class Repository:
    """
     Provides a unified interface for repositories
    """
    def __init__(self, name):
        """
        Will initialize the repository
        :param name: name of the data store
        """
        self.name = name

    def persist(self, obj):
        """Persists the given JSON in mongo collection
          :param obj: the object to persist
        """
        logging.debug("Persisting : %s", obj)

    def delete(self, selector):
        """Delete the given object
          :param selector: the object to delete
        """
        logging.debug("Deleting : %s", selector)

    def load(self, selector):
        """
        Retrieves the objects data store
        :param selector: filter criteria
        """
        logging.debug("Loading object by selector: %s", selector)

class JSONFSRepository(Repository):
    def __init__(self, directory):
        """
        A repository that just writes objects to a file
        :param directory: The directory where the objects needs to be written
        """
        #super().__init__(directory)
        super(JSONFSRepository, self).__init__(directory)

    def delete(self, selector):
        """
        Will remove the object form file system
        :param selector: the file ID
        """
        full_path = os.path.join(self.name, selector + ".json")
        logging.debug("Deleting %s", full_path)
        os.remove(full_path)

    def persist(self, obj):
        """Persists the given object in file system
          :param obj: the object to persist
        """
        full_path = os.path.join(self.name, obj['id'] + ".json")
        with open (full_path, 'w', encoding='utf8') as f:
            json.dump(obj, f, ensure_ascii=False)
        logging.debug("Persisting : %s", full_path)


    def load(self, selector):
        """
        Retrieves the json object from store
        :param selector: file ID
        """
        full_path = os.path.join(self.name, selector + ".json")
        logging.debug("Loading object by selector: %s", selector)
        with open (full_path) as f:
            obj = json.load(f)
        return obj

class BatchRepository(Repository, object):
    """
        A repository that decorates another one with batching support.
        This is usually useful in bulk loading of large data set
    """

    def __init__(self, batch_size, repo):
        """
        Will initialize the repository
        :param batch_size: The batch size needed
        :param repo: the repository to decorate
        """
        self.repo = repo
        self.batch = []
        self.batch_size = batch_size if batch_size > 1 else 1
        Repository.__init__(self, repo.name)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.flush()

    def flush(self):
        """
        Flushes the internal cache, by calling persist on actual repository
        Note : We can explicitly call flush when no more object are to be added
        """
        logging.info("Flushing")
        if len(self.batch) > 0:
            result = self.repo.persist(self.batch)
            del self.batch[:]
            return result

    def persist(self, obj):
        """ Will keep adding objects to internal cache and will persist once the cache is full
        :param obj: object to be persisted
        :return: None, if added to batch, else will return the output of flush
        """
        self.batch.append(obj)
        if len(self.batch) >= self.batch_size:
            logging.debug("Batch full, going to flush : %d", len(self.batch))
            return self.flush()

    def load(self, selector):
        """
        Will delegate to the repository that is decorated
        """
        return self.repo.load(selector)
