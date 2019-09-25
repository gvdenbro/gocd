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

package com.thoughtworks.go.domain.materials.git;

import com.thoughtworks.go.domain.materials.mercurial.StringRevision;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;

public class GitRevision extends StringRevision {

    private final String description;

    public GitRevision(String revision, String description) {
        super(revision);
        this.description = description;
    }

    @Override
    public Optional<String> getRevisionDescription() {
        return Optional.ofNullable(this.description);
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GitRevision)) {
            return false;
        }

        GitRevision that = (GitRevision) o;
        return StringUtils.equalsIgnoreCase(revision, that.revision);
    }

    public int hashCode() {
        return revision.hashCode();
    }

    public String toString() {
        return "GitRevision[" + revision + "]";
    }
}
