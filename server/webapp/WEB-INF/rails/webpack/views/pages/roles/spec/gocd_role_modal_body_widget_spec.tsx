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

import m from "mithril";
import {GoCDRole, Role} from "models/roles/roles";
import * as simulateEvent from "simulate-event";
import {GoCDRoleModalBodyWidget} from "views/pages/roles/role_modal_body_widget";
import {RolesTestData} from "views/pages/roles/spec/test_data";
import {TestHelper} from "views/pages/spec/test_helper";
import styles from "../index.scss";

describe("GoCDRoleModalBodyWidget", () => {
  const helper = new TestHelper();
  let gocdRole: GoCDRole;

  beforeEach(() => {
    gocdRole = Role.fromJSON(RolesTestData.GoCDRoleJSON()) as GoCDRole;
  });

  afterEach((done) => helper.unmount(done));
  it("should render view", () => {
    helper.mount(() => <GoCDRoleModalBodyWidget role={gocdRole} isNameDisabled={false}/>);

    expect(helper.findByDataTestId("form-field-input-role-name")).toBeInDOM();
    expect(helper.findByDataTestId("form-field-input-role-name")).not.toBeDisabled();
    expect(helper.findByDataTestId("form-field-input-role-name").prop("readonly")).toBeFalsy();

    expect(helper.findByDataTestId("form-field-input-role-users")).toBeInDOM();
    expect(helper.findByDataTestId("form-field-input-role-users")).not.toBeDisabled();

    expect(helper.findByDataTestId("role-add-user-button")).toBeInDOM();
    expect(helper.findByDataTestId("role-add-user-button")).not.toBeDisabled();
  });

  it("should disable role name when isNameDisabled is set to true", () => {
    helper.mount(() => <GoCDRoleModalBodyWidget role={gocdRole} isNameDisabled={true}/>);

    expect(helper.findByDataTestId("form-field-input-role-name")).toBeInDOM();
    expect(helper.findByDataTestId("form-field-input-role-name").prop("readonly")).toBeTruthy();

    expect(helper.findByDataTestId("form-field-input-role-users")).toBeInDOM();
    expect(helper.findByDataTestId("form-field-input-role-users")).not.toBeDisabled();

    expect(helper.findByDataTestId("role-add-user-button")).toBeInDOM();
    expect(helper.findByDataTestId("role-add-user-button")).not.toBeDisabled();
  });

  it("should add user when add user button is clicked", () => {
    helper.mount(() => <GoCDRoleModalBodyWidget role={gocdRole} isNameDisabled={false}/>);

    expect(gocdRole.attributes().hasUser("John")).toBeFalsy();

    helper.findByDataTestId("form-field-input-role-users").val("John");
    simulateEvent.simulate(helper.findByDataTestId("form-field-input-role-users").get(0), "input");
    helper.findByDataTestId("role-add-user-button").click();
    m.redraw.sync();

    expect(gocdRole.attributes().hasUser("John")).toBeTruthy();
  });

  it("should delete user when delete icon on user's tag is clicked", () => {
    helper.mount(() => <GoCDRoleModalBodyWidget role={gocdRole} isNameDisabled={false}/>);

    expect(gocdRole.attributes().users.length).toEqual(3);

    simulateEvent.simulate(helper.find(`.${styles.roleUserDeleteIcon}`).get(0), "click");
    m.redraw.sync();

    expect(gocdRole.attributes().users.length).toEqual(2);
  });
});
