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

import _ from "lodash";
import m from "mithril";
import Stream from "mithril/stream";
import {GoCDRole, Roles} from "models/roles/roles";
import {TriStateCheckbox} from "models/tri_state_checkbox";
import {UserFilters} from "models/users/user_filters";
import {User, Users} from "models/users/users";
import {TestHelper} from "views/pages/spec/test_helper";
import {UserViewHelper} from "views/pages/users/user_view_helper";
import {Attrs, UsersWidget} from "views/pages/users/users_widget";

const flag: (val?: boolean) => Stream<boolean> = Stream;

describe("UsersWidget", () => {
  const helper = new TestHelper();
  afterEach(helper.unmount.bind(helper));

  let attrs: Attrs;

  beforeEach(() => {
    attrs = {
      users: Stream(new Users(bob(), alice())),
      user: bob(),
      roles: Stream(new Roles()),
      userFilters: Stream(new UserFilters()),
      initializeRolesDropdownAttrs: _.noop,
      showRoles: flag(false),
      showFilters: flag(false),
      rolesSelection: Stream(new Map<GoCDRole, TriStateCheckbox>()),
      onEnable: _.noop,
      onDisable: _.noop,
      onDelete: _.noop,
      onRolesUpdate: _.noop,
      roleNameToAdd: Stream(),
      onRolesAdd: _.noop,
      onToggleAdmin: _.noop,
      userViewHelper: Stream(new UserViewHelper())
    };

    attrs.userViewHelper().systemAdmins().users([bob().loginName()]);

    helper.mount(() => <UsersWidget {...attrs}/>);
  });

  function bob() {
    return User.fromJSON({
                           email: "bob@example.com",
                           display_name: "Bob",
                           login_name: "bob",
                           is_admin: true,
                           email_me: true,
                           checkin_aliases: ["bob@gmail.com"],
                           enabled: true
                         });
  }

  function alice() {
    return User.fromJSON({
                           email: "alice@example.com",
                           display_name: "Alice",
                           login_name: "alice",
                           is_admin: false,
                           email_me: true,
                           checkin_aliases: ["alice@gmail.com", "alice@acme.com"],
                           enabled: false
                         });
  }

  it("should render a list of user attributes", () => {
    expect(helper.findByDataTestId("users-table")).toBeInDOM();
    expect(helper.findByDataTestId("users-header")[0].children[1]).toContainText("Username");
    expect(helper.findByDataTestId("users-header")[0].children[2]).toContainText("Display name");
    expect(helper.findByDataTestId("users-header")[0].children[4]).toContainText("System Admin");
    expect(helper.findByDataTestId("users-header")[0].children[5]).toContainText("Email");
    expect(helper.findByDataTestId("users-header")[0].children[6]).toContainText("Enabled");

    expect(helper.findByDataTestId("user-row")).toHaveLength(2);

    expect(helper.findByDataTestId("user-username")[0]).toContainText("bob");
    expect(helper.findByDataTestId("user-display-name")[0]).toContainText("Bob");
    expect(helper.findByDataTestId("user-email")[0]).toContainText("bob@example.com");
    expect(helper.findByDataTestId("user-enabled")[0]).toContainText("Yes");

    expect(helper.findByDataTestId("user-username")[1]).toContainText("alice");
    expect(helper.findByDataTestId("user-display-name")[1]).toContainText("Alice");
    expect(helper.findByDataTestId("user-email")[1]).toContainText("alice@example.com");
    expect(helper.findByDataTestId("user-enabled")[1]).toContainText("No");
  });

  it("should render in progress icon if update operation is in progress", () => {
    const user = attrs.users()[0];
    attrs.userViewHelper().userUpdateInProgress(user);

    m.redraw.sync();

    expect(helper.findIn(helper.findByDataTestId("user-super-admin-switch")[0], "Spinner-icon")).toBeInDOM();
  });

  it("should render success icon is update operation is successful", () => {
    const user = attrs.users()[0];
    attrs.userViewHelper().userUpdateSuccessful(user);

    m.redraw.sync();

    expect(helper.findByDataTestId("user-super-admin-switch"));
    expect(helper.findIn(helper.findByDataTestId("user-super-admin-switch")[0], "update-successful")).toBeInDOM();
  });

  it("should render error icon with message if update operation is unsuccessful", () => {
    const user = attrs.users()[0];
    attrs.userViewHelper().userUpdateFailure(user, "boom!");

    m.redraw.sync();

    expect(helper.findIn(helper.findByDataTestId("user-super-admin-switch")[0], "update-unsuccessful")).toBeInDOM();
    expect(helper.findByDataTestId("user-update-error-message")).toContainText("boom!");

  });
});
