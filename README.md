# ELVY: El Validator for YAML

The project adds a `elvy` command line that validates YAML files against
schemas using [yaml-language-server](https://github.com/redhat-developer/yaml-language-server).

## Usage

```shell
# rely on yaml-language-serve to guess the schema
elvy some.yml

# manually specify schema to use
elvy -s myschema.json some.yml
```
