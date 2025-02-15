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

import filesize from "filesize";
import m from "mithril";
import {ServerInfoWidget} from "views/pages/server_info/server_info_widget";
import {TestHelper} from "views/pages/spec/test_helper";

describe("Server Info Widget", () => {
  const helper = new TestHelper();
  afterEach((done) => helper.unmount(done));

  const metaInfo = {
    database_schema_version: "1230005",
    go_server_version: "19.4.0 (9155-0f01ab091e85a0d735b8b580eee5f83245fba2e5)",
    jvm_version: "12.0.1",
    pipeline_count: 184,
    usable_space_in_artifacts_repository: 123450698,
    os_information: "Linux 4.14.104-95.84.amzn2.x86_64",
  };

  it("should show Sever Information", () => {
    mount();

    expect(helper.findByDataTestId("about-page")).toContainText("Go Server Version:");
    expect(helper.findByDataTestId("about-page")).toContainText(metaInfo.go_server_version);

    expect(helper.findByDataTestId("about-page")).toContainText("JVM version:");
    expect(helper.findByDataTestId("about-page")).toContainText(metaInfo.jvm_version);

    expect(helper.findByDataTestId("about-page")).toContainText("OS Information:");
    expect(helper.findByDataTestId("about-page")).toContainText(metaInfo.os_information);

    expect(helper.findByDataTestId("about-page")).toContainText("Usable space in artifacts repository:");
    expect(helper.findByDataTestId("about-page")).toContainText(filesize(metaInfo.usable_space_in_artifacts_repository));

    expect(helper.findByDataTestId("about-page")).toContainText("Database schema version:");
    expect(helper.findByDataTestId("about-page")).toContainText(metaInfo.database_schema_version);

    expect(helper.findByDataTestId("about-page")).toContainText("Pipelines Count:");
    expect(helper.findByDataTestId("about-page")).toContainText(`${metaInfo.pipeline_count}`);
  });

  function mount() {
    helper.mount(() => <ServerInfoWidget meta={metaInfo}/>);
  }
});
