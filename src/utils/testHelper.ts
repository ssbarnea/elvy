/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createConnection, Connection, ClientCapabilities as LSPClientCapabilities } from 'vscode-languageserver/node';

// import { SettingsState } from 'yaml-language-server/lib/esm/yamlSettings';
import { SettingsState } from 'yaml-language-server/yamlSettings';

import { schemaRequestHandler, workspaceContext } from 'yaml-language-server/lib/esm/languageservice/services/schemaRequestHandler';
import { YAMLServerInit } from 'yaml-language-server/lib/esm/yamlServerInit';
import { LanguageService, LanguageSettings } from 'yaml-language-server/lib/esm';
import { ValidationHandler } from 'yaml-language-server/lib/esm/languageserver/handlers/validationHandlers';
import { LanguageHandlers } from 'yaml-language-server/lib/esm/languageserver/handlers/languageHandlers';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ClientCapabilities } from 'vscode-json-languageservice';
import { yamlDocumentsCache } from 'yaml-language-server/lib/esm/languageservice/parser/yaml-documents';

import path = require('path');

export function toFsPath(str: unknown): string {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof str}`);
  }

  let pathName;
  pathName = path.resolve(str);
  pathName = pathName.replace(/\\/g, '/');
  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = `/${pathName}`;
  }
  return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}

export const TEST_URI = 'file://~/Desktop/vscode-k8s/test.yaml';
export const SCHEMA_ID = 'default_schema_id.yaml';

export function setupTextDocument(content: string): TextDocument {
  yamlDocumentsCache.clear(); // clear cache
  return TextDocument.create(TEST_URI, 'yaml', 0, content);
}

export function setupSchemaIDTextDocument(content: string, customSchemaID?: string): TextDocument {
  yamlDocumentsCache.clear(); // clear cache
  if (customSchemaID) {
    return TextDocument.create(customSchemaID, 'yaml', 0, content);
  }
  return TextDocument.create(SCHEMA_ID, 'yaml', 0, content);
}

export interface TestLanguageServerSetup {
  languageService: LanguageService;
  validationHandler: ValidationHandler;
  languageHandler: LanguageHandlers;
  yamlSettings: SettingsState;
}

export function setupLanguageService(
  this: any, languageSettings: LanguageSettings,
): TestLanguageServerSetup {
  const yamlSettings = new SettingsState();
  process.argv.push('--node-ipc');
  const connection = createConnection();
  const schemaRequestHandlerWrapper = (
    // eslint-disable-next-line no-shadow
    connection: Connection, uri: string,
  ): Promise<string> => schemaRequestHandler(
    connection,
    uri,
    yamlSettings.workspaceFolders,
    yamlSettings.workspaceRoot,
    yamlSettings.useVSCodeContentRequest,
  );
  const schemaRequestService = schemaRequestHandlerWrapper.bind(this, connection);
  const serverInit = new YAMLServerInit(
    connection, yamlSettings, workspaceContext, schemaRequestService,
  );
  serverInit.connectionInitialized({
    processId: null,
    capabilities: ClientCapabilities.LATEST as LSPClientCapabilities,
    rootUri: null,
    workspaceFolders: null,
  });
  const { languageService } = serverInit;
  const { validationHandler } = serverInit;
  const { languageHandler } = serverInit;
  languageService.configure(languageSettings);
  return {
    languageService,
    validationHandler,
    languageHandler,
    yamlSettings,
  };
}
