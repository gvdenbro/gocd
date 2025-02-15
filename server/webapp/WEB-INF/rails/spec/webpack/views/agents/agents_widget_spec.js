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
import {SparkRoutes} from "helpers/spark_routes";
import {TestHelper} from "views/pages/spec/test_helper";
import {VM as AgentsVM} from "views/agents/models/agents_widget_view_model";
import {AgentsWidget} from "views/agents/agents_widget";
import {Agents} from "models/agents/agents";
import simulateEvent from "simulate-event";
import {SortOrder} from "views/agents/models/route_handler";
import _ from "lodash";
import Stream from "mithril/stream";
import m from "mithril";
import $ from "jquery";
import "jasmine-ajax";
import "jasmine-jquery";

describe("Agents Widget", () => {
  const helper       = new TestHelper();

  const showSpinner      = Stream();
  const permanentMessage = Stream({});

  let agentsVM;
  let agents;
  let routeHandler;

  let shouldShowAnalyticsIcon = false;

  beforeEach(() => {
    routeHandler           = Stream(new SortOrder());
    routeHandler().perform = _.noop;
  });

  const route = (isUserAdmin) => {
    helper.route('/', () => {
      return {
        '/':                  {
          view() {
            return m(AgentsWidget, {
              vm:                   agentsVM,
              allAgents:            agents,
              isUserAdmin,
              showSpinner,
              permanentMessage,
              shouldShowAnalyticsIcon,
              sortOrder:            routeHandler,
              doCancelPolling:      _.noop,
              doRefreshImmediately: _.noop
            });
          }
        },
        '/:sortBy/:orderBy': {
          view() {
            return m(AgentsWidget, {
              vm:                   agentsVM,
              allAgents:            agents,
              isUserAdmin,
              showSpinner,
              permanentMessage,
              shouldShowAnalyticsIcon,
              sortOrder:            routeHandler,
              doCancelPolling:      _.noop,
              doRefreshImmediately: _.noop
            });
          }
        }
      };
    });
    m.route.set('/');
    m.redraw.sync();
  };

  const unmount = () => {
    helper.unmount();
  };

  beforeEach(() => {
    agentsVM = new AgentsVM(Stream(''));
    agents   = Stream(Agents.fromJSON(allAgentsJSON));
    agentsVM.initializeWith(agents());

    route(true);
  });

  afterEach(() => {
    unmount();
  });

  it('should contain the agent rows equal to the number of agents', () => {
    const agentRows = helper.find('table tbody tr');
    expect(agentRows).toHaveLength(2);
  });

  it('should contain the agent row information', () => {
    const agentInfo      = helper.find('table tbody tr')[0];
    const firstAgentInfo = $(agentInfo).find('td');
    expect(firstAgentInfo).toHaveLength(10);
    expect($(firstAgentInfo[0]).find(':checkbox')).toExist();
    expect($(firstAgentInfo[2]).find('.content')).toHaveText('host-1');
    expect($(firstAgentInfo[3]).find('.content')).toHaveText('usr/local/foo');
    expect($(firstAgentInfo[4]).find('.content')).toHaveText('Linux');
    expect($(firstAgentInfo[5]).find('.content')).toHaveText('10.12.2.200');
    expect($(firstAgentInfo[6]).find('.content')).toContainText('Disabled (Building)');
    expect($(firstAgentInfo[7]).find('.content')).toHaveText('Unknown');
    expect($(firstAgentInfo[8]).find('.content')).toHaveText('Firefox');
    expect($(firstAgentInfo[9]).find('.content')).toHaveText('Dev, Test');
  });

  it('should contain the analytics icon row when analytics icon should be shown', () => {
    shouldShowAnalyticsIcon = true;
    m.redraw.sync();

    expect(helper.find('th')).toHaveLength(11);
  });

  it('should select all the agents when selectAll checkbox is checked', () => {
    const allBoxes          = helper.find('tbody :checkbox');
    const selectAllCheckbox = helper.find('thead :checkbox');

    expect(selectAllCheckbox[0]).not.toBeChecked();
    expect(allBoxes[0]).not.toBeChecked();
    expect(allBoxes[1]).not.toBeChecked();

    $(selectAllCheckbox).click();
    m.redraw.sync();

    expect(allBoxes[0]).toBeChecked();
    expect(allBoxes[1]).toBeChecked();

  });

  it('should check select all checkbox on selecting all the checkboxes', () => {
    const allBoxes          = helper.find('tbody :checkbox');
    const selectAllCheckbox = helper.find('thead :checkbox');

    expect(selectAllCheckbox[0]).not.toBeChecked();
    expect(allBoxes[0]).not.toBeChecked();

    $(allBoxes[0]).click();
    $(allBoxes[1]).click();
    m.redraw.sync();

    expect(selectAllCheckbox[0]).toBeChecked();
  });

  it('should hide all dropdown on click of the body', () => {
    clickAllAgents();

    jasmine.Ajax.withMock(() => {
      stubResourcesList();
      const resourceButton = helper.find("button:contains('Resources')");
      resourceButton.click();
      m.redraw.sync();

      expect($(resourceButton).parent().attr('class')).toContain('is-open');

      const body = helper.find('.agents-search-panel');
      $(body).click();
      m.redraw.sync();

      expect($(resourceButton).parent().attr('class')).not.toContain('is-open');
    });
  });

  it('should not hide dropdown on click of dropdown list', () => {
    clickAllAgents();

    jasmine.Ajax.withMock(() => {
      stubResourcesList();

      const resourceButton = helper.find("button:contains('Resources')");
      simulateEvent.simulate(resourceButton.get(0), 'click');
      m.redraw.sync();
      expect(resourceButton.parent()).toHaveClass('is-open');
      simulateEvent.simulate(helper.find('.resource-dropdown').get(0), 'click');
      m.redraw.sync();
      expect(resourceButton.parent()).toHaveClass('is-open');
    });
  });

  it('should not allow operations when user is non-admin', () => {
    unmount();
    route(false);
    clickAllAgents();
    const sampleButton = helper.find("button:contains('Resources')");
    expect(sampleButton).toBeDisabled();
  });

  it('should show message after disabling the agents', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();

      allowBulkUpdate('PATCH');
      let message = helper.find('.callout');
      expect(message).toHaveLength(0);
      simulateEvent.simulate(helper.find("button:contains('Disable')").get(0), 'click');
      m.redraw.sync();
      message = helper.find('.callout');
      expect(message).toHaveText('Disabled 2 agents');
    });
  });


  it('should show message after enabling the agents', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      allowBulkUpdate('PATCH');

      let message = helper.find('.callout');
      expect(message).toHaveLength(0);
      simulateEvent.simulate(helper.find("button:contains('Enable')").get(0), 'click');
      m.redraw.sync();
      message = helper.find('.callout');
      expect(message).toHaveText('Enabled 2 agents');
    });
  });

  it('should show message after deleting the agents', () => {
    unmount();
    route(true);

    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      allowBulkUpdate('DELETE');

      let message = helper.find('.callout');
      expect(message).toHaveLength(0);
      simulateEvent.simulate(helper.find("button:contains('Delete')").get(0), 'click');
      m.redraw.sync();
      message = helper.find('.callout');
      expect(message).toHaveText('Deleted 2 agents');
    });
  });

  it('should show message after updating resource of the agents', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      allowBulkUpdate('PATCH');
      stubResourcesList();

      let message = helper.find('.callout');
      expect(message).toHaveLength(0);

      simulateEvent.simulate(helper.find("button:contains('Resources')").get(0), 'click');
      m.redraw.sync();

      simulateEvent.simulate(helper.find(".add-resource button:contains('Apply')").get(0), 'click');
      m.redraw.sync();

      message = helper.find('.callout');
      expect(message).toHaveText('Resources modified on 2 agents');
    });
  });

  it('should show message after updating environment of the agents', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      allowBulkUpdate('PATCH');
      stubEnvironmentsList();

      let message = helper.find('.callout');
      expect(message).toHaveLength(0);

      simulateEvent.simulate(helper.find("button:contains('Environments')").get(0), 'click');
      m.redraw.sync();

      simulateEvent.simulate(helper.find(".env-dropdown button:contains('Apply')").get(0), 'click');
      m.redraw.sync();

      message = helper.find('.callout');
      expect(message).toHaveText('Environments modified on 2 agents');
    });
  });

  it('should show only filtered agents after inserting filter text', () => {
    const searchField     = helper.find('#filter-agent').get(0);
    let agentsCountOnPage = helper.find('.agents-table-body .agents-table tbody tr');
    expect(agentsCountOnPage).toHaveLength(2);

    $(searchField).val('host-2');
    simulateEvent.simulate(searchField, 'input');
    m.redraw.sync();

    agentsCountOnPage = helper.find('.agents-table-body .agents-table tbody tr');
    expect(agentsCountOnPage).toHaveLength(1);

    $(searchField).val('host-');
    simulateEvent.simulate(searchField, 'input');
    m.redraw.sync();

    agentsCountOnPage = helper.find('.agents-table-body .agents-table tbody tr');
    expect(agentsCountOnPage).toHaveLength(2);
  });

  it('should preserve the selection of agents during filter', () => {
    const searchField = helper.find('#filter-agent').get(0);

    $(searchField).val('host-1');
    simulateEvent.simulate(searchField, 'input');
    m.redraw.sync();

    let allBoxes = helper.find('.agents-table-body .agents-table tbody tr input[type="checkbox"]');
    allBoxes.each((_i, checkbox) => {
      simulateEvent.simulate(checkbox, 'click');
    });

    $(searchField).val('');
    simulateEvent.simulate(searchField, 'input');
    m.redraw.sync();

    allBoxes = helper.find('.agents-table tbody tr input[type="checkbox"]');
    expect(allBoxes).toHaveLength(2);
    expect(allBoxes[0]).toBeChecked();
    expect(allBoxes[1]).not.toBeChecked();
  });

  it('should allow sorting', () => {
    const getHostnamesInTable = () => {
      const hostnameCells = helper.find(".agents-table tbody td:nth-child(3)");

      return hostnameCells.map((_i, cell) => $(cell).find('.content').text()).toArray();
    };

    let agentNameHeader = helper.find("label:contains('Agent Name')");
    simulateEvent.simulate(agentNameHeader.get(0), 'click');
    m.redraw.sync();

    expect(getHostnamesInTable()).toEqual(['host-1', 'host-2']);

    agentNameHeader = helper.find("label:contains('Agent Name')");
    simulateEvent.simulate(agentNameHeader.get(0), 'click');
    m.redraw.sync();

    expect(getHostnamesInTable()).toEqual(['host-2', 'host-1']);

    agentNameHeader = helper.find("label:contains('Agent Name')");
    simulateEvent.simulate(agentNameHeader.get(0), 'click');
    m.redraw.sync();

    expect(getHostnamesInTable()).toEqual(['host-1', 'host-2']);
  });

  it('should toggle the resources list on click of the resources button', () => {
    unmount();
    route(true);

    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      stubResourcesList();
      const resourceButton = helper.find("button:contains('Resources')");
      let resourcesList    = helper.find('.has-dropdown')[0];
      expect(resourcesList.classList).not.toContain('is-open');

      $(resourceButton).click();
      m.redraw.sync();

      resourcesList = helper.find('.has-dropdown')[0];
      expect(resourcesList.classList).toContain('is-open');

      resourceButton.click();
      m.redraw.sync();
      expect(resourcesList.classList).not.toContain('is-open');
    });
  });

  it('should toggle the environments list on click of the environments button', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      stubEnvironmentsList();

      const environmentButton = helper.find("button:contains('Environments')");
      let environmentsList    = helper.find('.has-dropdown')[1];
      expect(environmentsList.classList).not.toContain('is-open');

      $(environmentButton).click();
      m.redraw.sync();
      environmentsList = helper.find('.has-dropdown')[1];
      expect(environmentsList.classList).toContain('is-open');

      environmentButton.click();
      m.redraw.sync();
      expect(environmentsList.classList).not.toContain('is-open');
    });
  });

  it('should hide the resources list on click of the environments button', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      stubResourcesList();
      stubEnvironmentsList();
      const environmentButton = helper.find("button:contains('Environments')");
      const resourcesButton   = helper.find("button:contains('Resources')");
      const resourcesDropdown = helper.find("button:contains('Resources')").parent()[0];

      resourcesButton.click();
      m.redraw.sync();

      expect(resourcesDropdown.classList).toContain('is-open');

      environmentButton.click();
      m.redraw.sync();

      expect(resourcesDropdown.classList).not.toContain('is-open');

      hideAllDropDowns();
    });
  });

  it('should hide the environment list on click of the resource button', () => {
    jasmine.Ajax.withMock(() => {
      clickAllAgents();
      stubResourcesList();
      stubEnvironmentsList();

      const environmentButton    = helper.find("button:contains('Environments')");
      const resourcesButton      = helper.find("button:contains('Resources')");
      const environmentsDropdown = helper.find("button:contains('Environments')").parent()[0];

      environmentButton.click();
      m.redraw.sync();

      expect(environmentsDropdown.classList).toContain('is-open');

      resourcesButton.click();
      m.redraw.sync();

      expect(environmentsDropdown.classList).not.toContain('is-open');

      hideAllDropDowns();
    });
  });

  it('should show build details dropdown for building agent', () => {
    let buildingAgentStatus = helper.find(".agents-table tbody td:nth-child(7)")[0];
    expect(buildingAgentStatus).not.toHaveClass('is-open');
    const buildingDetailsLink = $(buildingAgentStatus).find('.has-build-details-drop-down')[0];

    simulateEvent.simulate(buildingDetailsLink, "click");
    m.redraw.sync();

    buildingAgentStatus = helper.find(".agents-table tbody td:nth-child(7)")[0];
    expect(buildingAgentStatus).toHaveClass('is-open');
  });

  const clickAllAgents = () => {
    const uuids = agents().collectAgentProperty('uuid');
    _.forEach(uuids, (uuid) => {
      agentsVM.agents.checkboxFor(uuid)(true);
    });
    m.redraw.sync();
  };

  const hideAllDropDowns = () => {
    agentsVM.dropdown.hideAllDropDowns();
    m.redraw.sync();
  };

  const allowBulkUpdate = (method) => {
    jasmine.Ajax.stubRequest(SparkRoutes.agentsPath(), null, method).andReturn({
      responseText: JSON.stringify({}),
      headers:      {
        'Content-Type': 'application/json'
      },
      status:       200
    });
  };

  const stubResourcesList = () => {
    jasmine.Ajax.stubRequest('/go/api/admin/internal/resources', null, 'GET').andReturn({
      responseText: JSON.stringify(['Linux', 'Gauge', 'Java', 'Windows']),
      headers:      {
        'Content-Type': 'application/json'
      },
      status:       200
    });
  };

  const stubEnvironmentsList = () => {
    jasmine.Ajax.stubRequest('/go/api/admin/internal/environments', null, 'GET').andReturn({
      responseText: JSON.stringify(['Dev', 'Build', 'Testing', 'Deploy']),
      headers:      {
        'Content-Type': 'application/json'
      },
      status:       200
    });
  };

  /* eslint-disable camelcase */
  const allAgentsJSON = [
    {
      "_links":             {
        "self": {
          "href": "https://ci.example.com/go/api/agents/dfdbe0b1-4521-4a52-ac2f-ca0cf6bdaa3e"
        },
        "doc":  {
          "href": "https://api.gocd.org/#agents"
        },
        "find": {
          "href": "https://ci.example.com/go/api/agents/:uuid"
        }
      },
      "uuid":               "dfdbe0b1-4521-4a52-ac2f-ca0cf6bdaa3e",
      "hostname":           "host-1",
      "ip_address":         "10.12.2.200",
      "sandbox":            "usr/local/foo",
      "operating_system":   "Linux",
      "free_space":         "unknown",
      "agent_config_state": "Disabled",
      "agent_state":        "Missing",
      "build_state":        "Building",
      "resources":          [
        "Firefox"
      ],
      "environments": [
        {
          "name": "Dev",
          "origin": {
            "type":   "gocd",
            "_links": {
              "self": {
                "href": "http://localhost:8153/go/admin/config_xml"
              },
              "doc":  {
                "href": "https://api.gocd.org/19.2.0/#get-configuration"
              }
            }
          }
        },
        {
          "name": "Test",
          "origin": {
            "type":   "gocd",
            "_links": {
              "self": {
                "href": "http://localhost:8153/go/admin/config_xml"
              },
              "doc":  {
                "href": "https://api.gocd.org/19.2.0/#get-configuration"
              }
            }
          }
        }
      ],
      "build_details":      {
        "_links":   {
          "job":      {
            "href": "http://localhost:8153/go/tab/build/detail/up42/2/up42_stage/1/up42_job"
          },
          "stage":    {
            "href": "http://localhost:8153/go/pipelines/up42/2/up42_stage/1"
          },
          "pipeline": {
            "href": "http://localhost:8153/go/tab/pipeline/history/up42"
          }
        },
        "pipeline": "up42",
        "stage":    "up42_stage",
        "job":      "up42_job"
      }
    },
    {
      "_links":             {
        "self": {
          "href": "https://ci.example.com/go/api/agents/dfdbe0b1-aa31-4a52-ac42d-ca0cf6bdaa3e"
        },
        "doc":  {
          "href": "https://api.gocd.org/#agents"
        },
        "find": {
          "href": "https://ci.example.com/go/api/agents/:uuid"
        }
      },
      "uuid":               "dfdbe0b1-aa31-4a52-ac42d-ca0cf6bdaa3e",
      "hostname":           "host-2",
      "ip_address":         "10.12.2.201",
      "sandbox":            "usr/local/bin",
      "operating_system":   "Linux",
      "free_space":         "unknown",
      "agent_config_state": "Disabled",
      "agent_state":        "Missing",
      "build_state":        "Unknown",
      "resources":          [
        "Chrome"
      ],
      "environments": [
        {
          "name": "Test",
          "origin": {
            "type":   "gocd",
            "_links": {
              "self": {
                "href": "http://localhost:8153/go/admin/config_xml"
              },
              "doc":  {
                "href": "https://api.gocd.org/19.2.0/#get-configuration"
              }
            }
          }
        }
      ]
    }
  ];
  /* eslint-enable camelcase */
});
