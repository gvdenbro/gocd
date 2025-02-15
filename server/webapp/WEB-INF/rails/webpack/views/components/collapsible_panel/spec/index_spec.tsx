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
import {TestHelper} from "views/pages/spec/test_helper";
import {CollapsiblePanel} from "../index";
import styles from "../index.scss";

import * as simulateEvent from "simulate-event";

describe("Collapsible Panel Component", () => {

  const pageTitle = "Test Header";
  const body      = [<div class="collapse-content">This is body</div>];
  const helper    = new TestHelper();

  afterEach(helper.unmount.bind(helper));

  it("should render expand collapsible component", () => {
    mount();
    expect(helper.findByDataTestId("collapse-header")).toContainText(pageTitle);
    expect(helper.find(".collapse-content")).toBeInDOM();
  });

  it("should render component, collapsed by default", () => {
    mount();
    expect(helper.findByDataTestId("collapse-header")).not.toHaveClass(styles.expanded);
    expect(helper.findByDataTestId("collapse-body")).toHaveClass(styles.hide);
  });

  it("should toggle component state on click", () => {
    mount();
    expect(helper.findByDataTestId("collapse-header")).not.toHaveClass(styles.expanded);
    expect(helper.findByDataTestId("collapse-body")).toHaveClass(styles.hide);

    simulateEvent.simulate(helper.findByDataTestId("collapse-header").get(0), "click");
    helper.redraw();

    expect(helper.findByDataTestId("collapse-header")).toHaveClass(styles.expanded);
    expect(helper.findByDataTestId("collapse-body")).not.toHaveClass(styles.hide);

    simulateEvent.simulate(helper.findByDataTestId("collapse-header").get(0), "click");
    helper.redraw();

    expect(helper.findByDataTestId("collapse-header")).not.toHaveClass(styles.expanded);
    expect(helper.findByDataTestId("collapse-body")).toHaveClass(styles.hide);
  });

  it("should apply error state", () => {
    mount(true);
    expect(helper.findByDataTestId("collapsible-panel-wrapper")).toHaveClass(styles.error);
  });

  function mount(error?: boolean) {
    helper.mount(() => <CollapsiblePanel error={error} dataTestId={"collapsible-panel-wrapper"}
                                         header={pageTitle}>{body}</CollapsiblePanel>);
  }

});
