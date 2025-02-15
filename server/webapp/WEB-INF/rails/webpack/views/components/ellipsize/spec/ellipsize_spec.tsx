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
import Stream from "mithril/stream";
import * as simulateEvent from "simulate-event";
import {Ellipsize} from "views/components/ellipsize/index";
import {TestHelper} from "views/pages/spec/test_helper";
import styles from "../index.scss";

describe("EllipsizeComponent", () => {
  const helper = new TestHelper();
  afterEach(helper.unmount.bind(helper));

  describe("Fixed", () => {
    it("should ellipsize when text string is bigger then specified size", () => {
      helper.mount(() => <Ellipsize text={"This is small"} size={5} fixed={true}/>);

      expect(helper.findByClass(styles.wrapper)).toBeInDOM();
      expect(helper.findByClass(styles.wrapper)).toHaveClass(styles.fixEllipsized);
      expect(helper.findByClass(styles.ellipsisActionButton)).not.toBeInDOM();
    });
  });

  describe("Size", () => {
    it("should show entire text if is smaller then specified size", () => {
      helper.mount(() => <Ellipsize text={"This is small"} size={15} fixed={false}/>);

      expect(helper.findByClass(styles.wrapper)).toBeInDOM();
      expect(helper.findByClass(styles.wrapper)).not.toHaveClass(styles.fixEllipsized);
      expect(helper.findByClass(styles.wrapper)).toHaveText("This is small");
      expect(helper.findByClass(styles.ellipsisActionButton)).not.toBeInDOM();
    });

    it("should show text of only specified size", () => {
      helper.mount(() => <Ellipsize text={"This is small"} size={5} fixed={false}/>);

      expect(helper.findByClass(styles.wrapper)).toBeInDOM();
      expect(helper.findByClass(styles.wrapper)).not.toHaveClass(styles.fixEllipsized);
      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This ...");
      expect(helper.findByClass(styles.ellipsisActionButton)).toBeInDOM();
    });
  });

  describe("Actions", () => {
    it("should expand and show full text on click of more", () => {
      helper.mount(() => <Ellipsize text={"This is small"} size={5} fixed={false}/>);

      expect(helper.findByClass(styles.wrapper)).toBeInDOM();
      expect(helper.findByClass(styles.wrapper)).not.toHaveClass(styles.fixEllipsized);
      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This ...");
      expect(helper.findByClass(styles.ellipsisActionButton)).toHaveText("more");

      simulateEvent.simulate(helper.findByClass(styles.ellipsisActionButton)[0], "click");
      m.redraw.sync();

      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This is small");
      expect(helper.findByClass(styles.ellipsisActionButton)).toBeInDOM();
      expect(helper.findByClass(styles.ellipsisActionButton)).toHaveText("less");
    });

    it("should ellipsize the text on click of less", () => {
      helper.mount(() => <Ellipsize text={"This is small"} size={5} fixed={false}/>);

      expect(helper.findByClass(styles.wrapper)).toBeInDOM();
      expect(helper.findByClass(styles.wrapper)).not.toHaveClass(styles.fixEllipsized);
      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This ...");
      expect(helper.findByClass(styles.ellipsisActionButton)).toHaveText("more");

      simulateEvent.simulate(helper.findByClass(styles.ellipsisActionButton)[0], "click");
      m.redraw.sync();

      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This is small");
      expect(helper.findByClass(styles.ellipsisActionButton)).toBeInDOM();
      expect(helper.findByClass(styles.ellipsisActionButton)).toHaveText("less");

      simulateEvent.simulate(helper.findByClass(styles.ellipsisActionButton)[0], "click");
      m.redraw.sync();

      expect(helper.findByDataTestId("ellipsized-content")).toHaveText("This ...");
    });
  });

  it("should render empty span if the text value is null", () => {
    const textValue = Stream(null) as Stream<any>;
    helper.mount(() => <Ellipsize text={textValue()} size={20} fixed={false}/>);

    expect(helper.findByClass(styles.wrapper)).toBeInDOM();
    expect(helper.findByClass(styles.ellipsisActionButton)).not.toBeInDOM();
    expect(helper.findByClass(styles.wrapper)).toBeEmpty();
  });

  it("should render empty span if the text value is undefined", () => {
    const textValue = Stream(undefined) as Stream<any>;
    helper.mount(() => <Ellipsize text={textValue()} size={20} fixed={false}/>);

    expect(helper.findByClass(styles.wrapper)).toBeInDOM();
    expect(helper.findByClass(styles.ellipsisActionButton)).not.toBeInDOM();
    expect(helper.findByClass(styles.wrapper)).toBeEmpty();
  });

});
