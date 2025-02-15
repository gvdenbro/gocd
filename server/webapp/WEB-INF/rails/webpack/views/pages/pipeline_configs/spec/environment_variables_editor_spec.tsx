/*
 * Copyright 2019 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {asSelector} from "helpers/css_proxies";
import m from "mithril";
import Stream from "mithril/stream";
import {EnvironmentVariableConfig} from "models/new_pipeline_configs/environment_variable_config";
import {EnvironmentVariablesEditor} from "views/pages/pipeline_configs/environment_variables_editor";
import {TestHelper} from "views/pages/spec/test_helper";
import css from "../environment_variables_editor.scss";

describe("EnvironmentVariablesEditor", () => {
  const helper = new TestHelper();
  const sel = asSelector<typeof css>(css);
  const variables: Stream<EnvironmentVariableConfig[]> = Stream();

  beforeEach(() => {
    variables([]);
    helper.mount(() => {
      return <EnvironmentVariablesEditor variables={variables}/>;
    });
  });

  afterEach(helper.unmount.bind(helper));

  it("adds variable", () => {
    addVariable(plainVars(), "name", "value");
    addVariable(secureVars(), "one", "two");
    assertModel(
      new EnvironmentVariableConfig(false, "name", "value"),
      new EnvironmentVariableConfig(true, "one", "two"),
    );
  });

  it("removes variable", () => {
    addVariable(plainVars(), "blah", "value");
    removeVariable(addVariable(plainVars(), "eek", "two"));
    removeVariable(addVariable(secureVars(), "eek", "two"));
    assertModel(
      new EnvironmentVariableConfig(false, "blah", "value"),
    );
  });

  function plainVars(): Element {
    return helper.find(sel.envVars).get(0);
  }

  function secureVars(): Element {
    return helper.find(sel.envVars).get(1);
  }

  function addVariable(section: Element, name: string, value: string): Element {
    helper.click("button", section);
    const variable = helper.findIn(section, "table-row").last();
    const fields = variable.find("input");
    helper.oninput(fields.get(0), name);
    helper.oninput(fields.get(1), value);
    return variable.get(0);
  }

  function removeVariable(variable: Element) {
    helper.click("button", variable);
  }

  function plainObj(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  function assertModel(...expected: EnvironmentVariableConfig[]) {
    return expect(plainObj(variables())).toEqual(plainObj(expected));
  }
});
