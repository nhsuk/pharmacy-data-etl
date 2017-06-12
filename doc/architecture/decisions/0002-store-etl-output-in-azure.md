# 2. Store ETL output in Azure

Date: 2017-06-12

## Status

Accepted

## Context

The output from the ETL is only available in the container and needs to be exposed to consuming applications.

## Decision

When the ETL has complete the output will be stored in an Azure blob.

## Consequences

Pharmacy data is available to other applications from the Azure blob store.
