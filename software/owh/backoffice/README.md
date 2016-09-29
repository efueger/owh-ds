## Introduction 
This folder contains implementation of various data ETLs.

## Directory structure
The ETL code is arrange in python package. All ETL code is under the package owh.etl.
owh.etl.common package contains all the common code. ETL implementation for each 
dataset is arranged on its own sub package. The configuration file for each dataset ETL 
is in the corresponding ETL implementation directory. YAML is used for configuration of the ETLs.

The common logging configuration is in owh.etl.common package.

## Implementing a new ETL
To implement a new ETL 
- Create a new sub package under owh.etl correspnding to the name of the dataset 
- Implement a new ETL class extending the base owh.common.ETL class

## Executing the ETL
Perform the following steps to execute an ETL.

1. Copy the dataset data files and any data mapping files to a directory or AWS S3 bucket
2. Update the configuration file (config.yaml) in the ETL folder with information about the ES DB and dataset folder/S3 bucket.
3. Set PYTHONPATH to include the backoffice directory
4. For the first time only, install boto and yaml python modules (pip install boto pyyaml)
5. Run command
> python etl\own\<dataset_name>\<dataset_name>_etl.py
> E.g. python etl\own\mortality\mortality_etl.py
> Note: The ETL required Python 2.7.x and does not work with Python 3.x

 