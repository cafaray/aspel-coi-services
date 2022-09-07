# ASPEL COI Services

Essential services to expose COI as a satellite for other applications. The tool is deveoped under nodejs using plugin to connect to Firebird database. This REST-DATA application connects to the database and returns values in original form, it does not make any treatment with the data.

> TIP! To start up the database using Docker use:
> `docker run -d --name firebird -p 3050:3050 -v /home/omash/workspace/database/firebird/:/var/lib/firebird/2.5/data/ almeida/firebird`