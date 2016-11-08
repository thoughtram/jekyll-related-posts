module.exports = class YamlFileMetaData {
  constructor (filePath, yamlProperties, headContent, content) {
    this.filePath = filePath;
    this.yamlProperties = yamlProperties;
    this.headContent = headContent;
    this.content = content;
  }
}
