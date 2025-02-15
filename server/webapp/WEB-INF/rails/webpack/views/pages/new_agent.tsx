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

import {AjaxPoller} from "helpers/ajax_poller";
import {ApiResult, ErrorResponse} from "helpers/api_request_builder";
import m from "mithril";
import Stream from "mithril/stream";
import {Agents} from "models/new_agent/agents";
import {AgentsCRUD} from "models/new_agent/agents_crud";
import {ElasticAgentVM, StaticAgentsVM} from "models/new_agent/agents_vm";
import {PluginInfoCRUD} from "models/shared/plugin_infos_new/plugin_info_crud";
import {MessageType} from "views/components/flash_message";
import {AgentsWidget} from "views/pages/new_agents/agents_widget";
import {Page, PageState} from "views/pages/page";
import {RequiresPluginInfos} from "views/pages/page_operations";

interface State extends RequiresPluginInfos {
  staticAgentsVM: StaticAgentsVM;
  elasticAgentsVM: ElasticAgentVM;
  repeater: AjaxPoller<void>;
  onEnable: (e: MouseEvent) => void;
  onDisable: (e: MouseEvent) => void;
  onDelete: (e: MouseEvent) => void;
  updateEnvironments: (environmentsToAdd: string[], environmentsToRemove: string[]) => Promise<any>;
  updateResources: (resourcesToAdd: string[], resourcesToRemove: string[]) => Promise<any>;
}

export class NewAgentPage extends Page<null, State> {
  oninit(vnode: m.Vnode<null, State>) {
    const self                  = this;
    vnode.state.staticAgentsVM  = new StaticAgentsVM();
    vnode.state.elasticAgentsVM = new ElasticAgentVM();
    vnode.state.pluginInfos     = Stream();

    vnode.state.onEnable = () => {
      const uuids = vnode.state.staticAgentsVM.selectedAgentsUUID();
      AgentsCRUD.agentsToEnable(uuids)
                .then((result) => self.onResult(result, "Enabled", uuids.length))
                .then(vnode.state.staticAgentsVM.unselectAll.bind(vnode.state.staticAgentsVM))
                .finally(self.fetchData.bind(self, vnode));
    };

    vnode.state.onDisable = () => {
      const uuids = vnode.state.staticAgentsVM.selectedAgentsUUID();
      AgentsCRUD.agentsToDisable(uuids)
                .then((result) => self.onResult(result, "Disabled", uuids.length))
                .then(vnode.state.staticAgentsVM.unselectAll.bind(vnode.state.staticAgentsVM))
                .finally(self.fetchData.bind(self, vnode));
    };

    vnode.state.onDelete = () => {
      const uuids = vnode.state.staticAgentsVM.selectedAgentsUUID();
      AgentsCRUD.delete(uuids)
                .then((result) => self.onResult(result, "Deleted", uuids.length))
                .finally(self.fetchData.bind(self, vnode));
    };

    vnode.state.updateEnvironments = (environmentsToAdd: string[], environmentsToRemove: string[]) => {
      const uuids = vnode.state.staticAgentsVM.selectedAgentsUUID();
      return AgentsCRUD.updateEnvironmentsAssociation(uuids, environmentsToAdd, environmentsToRemove)
                       .then(vnode.state.staticAgentsVM.unselectAll.bind(vnode.state.staticAgentsVM))
                       .finally(self.fetchData.bind(self, vnode));
    };

    vnode.state.updateResources = (resourcesToAdd: string[], resourcesToRemove: string[]) => {
      const uuids = vnode.state.staticAgentsVM.selectedAgentsUUID();
      return AgentsCRUD.updateResources(uuids, resourcesToAdd, resourcesToRemove)
                       .then(vnode.state.staticAgentsVM.unselectAll.bind(vnode.state.staticAgentsVM))
                       .finally(self.fetchData.bind(self, vnode));
    };

    new AjaxPoller({
                     repeaterFn: this.fetchData.bind(this, vnode),
                     intervalSeconds: 10
                   }).start();
  }

  componentToDisplay(vnode: m.Vnode<null, State>): m.Children {
    return <AgentsWidget staticAgentsVM={vnode.state.staticAgentsVM}
                         elasticAgentsVM={vnode.state.elasticAgentsVM}
                         onEnable={vnode.state.onEnable.bind(vnode.state)}
                         onDisable={vnode.state.onDisable.bind(vnode.state)}
                         onDelete={vnode.state.onDelete.bind(vnode.state)}
                         flashMessage={this.flashMessage}
                         updateEnvironments={vnode.state.updateEnvironments.bind(vnode.state)}
                         updateResources={vnode.state.updateResources.bind(vnode.state)}
                         showAnalyticsIcon={this.showAnalyticsIcon()}
                         pluginInfos={vnode.state.pluginInfos}
                         isUserAdmin={Page.isUserAnAdmin()}/>;
  }

  pageName(): string {
    return "Agents";
  }

  fetchData(vnode: m.Vnode<null, State>): Promise<any> {
    return Promise.all([AgentsCRUD.all(), PluginInfoCRUD.all({})])
                  .then((results) => {
                    results[0].do((successResponse) => NewAgentPage.syncVMState(vnode, successResponse.body),
                                  this.setErrorState);
                    results[1].do((successResponse) => vnode.state.pluginInfos(successResponse.body),
                                  this.setErrorState);
                  }).finally(() => {
        this.pageState = PageState.OK;
      });
  }

  private static syncVMState(vnode: m.Vnode<null, State>, agents: Agents) {
    vnode.state.staticAgentsVM.sync(agents);
    vnode.state.elasticAgentsVM.sync(agents);
  }

  private static pluralizeAgent(count: number) {
    return count > 1 ? "agents" : "agent";
  }

  private onResult(result: ApiResult<string>, action: string, count: number) {
    result.do(this.onSuccess.bind(this, action, count), this.onFailure.bind(this));
  }

  private onSuccess(action: string, count: number) {
    this.flashMessage.setMessage(MessageType.success, `${action} ${count} ${NewAgentPage.pluralizeAgent(count)}`);
  }

  private onFailure(errorResponse: ErrorResponse) {
    this.flashMessage.setMessage(MessageType.alert, errorResponse.message);
  }

  private showAnalyticsIcon() {
    const metaData = Page.readAttribute("data-meta");
    if (metaData) {
      const parsedMetadata = JSON.parse(metaData);
      if (parsedMetadata.hasOwnProperty("data-should-show-analytics-icon")) {
        return parsedMetadata["data-should-show-analytics-icon"];
      }
    }

    return false;
  }
}
