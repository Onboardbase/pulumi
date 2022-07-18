// Copyright 2016-2021, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as pulumi from "@pulumi/pulumi";
import { aesDecryptSecret, fetchSecrets } from "./utils";

export interface OnboardbaseSecretsArgs {
  project: pulumi.Input<string>;
  environment: pulumi.Input<string>;
  apiKey: pulumi.Input<string>;
  passcode: pulumi.Input<string>;
}

type OnboardbaseSecret = string;

type OnboardbaseSecretsType = Record<string, OnboardbaseSecret>;

export class OnboardbaseSecrets extends pulumi.ComponentResource {
  // public readonly bucket: aws.s3.Bucket;
  // public readonly websiteUrl: pulumi.Output<string>;
  public secrets: pulumi.Output<OnboardbaseSecretsType>;
  private readonly args: OnboardbaseSecretsArgs;

  constructor(
    name: string,
    args: OnboardbaseSecretsArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("onboardbase:index:secrets", name, args, opts);
    this.args = args;
    const secrets: OnboardbaseSecretsType = {};
    this.secrets = pulumi.output(secrets);
  }

  async fetchSecrets() {
    try {
      const data = await fetchSecrets(
        this.args.apiKey as string,
        this.args.project as string,
        this.args.environment as string
      );
      const encSecrets =
        data.data.generalPublicProjects.list[0].publicEnvironments.list[0].key;

      const arrOfEncSecrets = JSON.parse(encSecrets);
      const secrets: Record<string, OnboardbaseSecret> = {};
      for (let i = 0; i < arrOfEncSecrets.length; i++) {
        const encSecret = arrOfEncSecrets[i];
        const decSecret = await aesDecryptSecret(
          encSecret,
          this.args.passcode as string
        );
        const decSecretObj: { key: string; value: string } =
          JSON.parse(decSecret);
        secrets[decSecretObj.key] = decSecretObj.value;
      }
      this.secrets = pulumi.output(secrets);
      this.registerOutputs({ secrets });
    } catch (e) {
      throw new Error(
        "Unable to fetch secrets. You may not be authorized please check your API key"
      );
    }
  }
}
