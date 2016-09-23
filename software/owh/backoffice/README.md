## Introduction 
This folder contains implementation of various data ETLs.

## Directory structure
The ETL code is arrange in python package. All ETL code is under the package owh.etl.
owh.etl.common package contains all the common code. ETL implementation for each 
dataset is arranged on its own sub package. The configuration file for each dataset ETL 
is in the corresponding ETL implementation directory. YAML is used for configuration of the ETLs.

The common logging configuration is in owh.etl.common package.

## Executing the ETL

Perform the following steps to execute an ETL.

1. Copy the dataset data files to a directory.
2. Update the configuration file (config.yaml) in the ETL folder with information about the ES DB and dataset folder.
3. Set PYTHONPATH to include this directory. 
4. Run Command
> python etl\own\<dataset_name>\<dataset_name>_etl.py
> E.g. python etl\own\mortality\mortality_etl.py
> Note: The ETL required Python 2.7.x and does not work with Python 3.x

 