
# Pulumi Component Provider Boilerplate (TypeScript)

This repo is a boilerplate showing how to create a Pulumi component provider written in TypeScript. You can search-replace `xyz` with the name of your desired provider as a starting point for creating a component provider for your component resources.

## Background
This repository is part of the [guide for authoring and publishing a Pulumi Package](https://www.pulumi.com/docs/guides/pulumi-packages/how-to-author).

Learn about the concepts behind [Pulumi Packages](https://www.pulumi.com/docs/guides/pulumi-packages/#pulumi-packages) and, more specifically, [Pulumi Components](https://www.pulumi.com/docs/intro/concepts/resources/components/)

## Prerequisites

- Pulumi CLI
- Node.js
- Yarn
- Go 1.17 (to regenerate the SDKs)
- Python 3.6+ (to build the Python SDK)
- .NET Core SDK (to build the .NET SDK)

## Build and Test

---
```bash
# Build and install the provider
make test_nodejs
```
---

## Packaging

The provider plugin can be packaged into a tarball and hosted at a custom server URL to make it easier to distribute to users.

Currently, five tarball files are necessary for Linux, macOS, and Windows (`pulumi-resource-onboardbase-v0.0.1-linux-amd64.tar.gz`, `pulumi-resource-onboardbase-v0.0.1-linux-arm64.tar.gz` `pulumi-resource-onboardbase-v0.0.1-darwin-amd64.tar.gz`, `pulumi-resource-onboardbase-v0.0.1-darwin-arm64.tar.gz`, `pulumi-resource-onboardbase-v0.0.1-windows-amd64.tar.gz`) each containing the same files: the platform-specific binary `pulumi-resource-onboardbase`, README and LICENSE. The fill set of binaries can be automatically generated using the command `make dist`.

## Example component

Let's look at the example `StaticPage` component resource in more detail.

### Schema

The example `StaticPage` component resource is defined in `schema.json`:

---
```json
"resources": {
    "xyz:index:StaticPage": {
        "isComponent": true,
        "inputProperties": {
            "indexContent": {
                "type": "string",
                "description": "The HTML content for index.html."
            }
        },
        "requiredInputs": [
            "indexContent"
        ],
        "properties": {
            "bucket": {
                "$ref": "/aws/v3.30.0/schema.json#/resources/aws:s3%2Fbucket:Bucket",
                "description": "The bucket resource."
            },
            "websiteUrl": {
                "type": "string",
                "description": "The website URL."
            }
        },
        "required": [
            "bucket",
            "websiteUrl"
        ]
    }
}
```
---

The component resource's type token is `xyz:index:StaticPage` in the format of `<package>:<module>:<type>`. In this case, it's in the `xyz` package and `index` module. This is the same type token passed inside the implementation of `StaticPage` in `provider/cmd/pulumi-resource-xyz/staticPage.ts`, and also the same token referenced in `construct` in `provider/cmd/pulumi-resource-xyz/provider.ts`.

This component has a required `indexContent` input property typed as `string`, and two required output properties: `bucket` and `websiteUrl`. Note that `bucket` is typed as the `aws:s3/bucket:Bucket` resource from the `aws` provider (in the schema the `/` is escaped as `%2F`).

Since this component returns a type from the `aws` provider, each SDK must reference the associated Pulumi `aws` SDK for the language. For the .NET, Node.js, and Python SDKs, dependencies are specified in the `language` section of the schema:

---
```json
"language": {
    "csharp": {
        "packageReferences": {
            "Pulumi": "2.*",
            "Pulumi.Aws": "3.*"
        }
    },
    "nodejs": {
        "dependencies": {
            "@pulumi/aws": "^3.30.0"
        },
        "devDependencies": {
            "typescript": "^3.7.0"
        }
    },
    "python": {
        "requires": {
            "pulumi": ">=2.21.2,<3.0.0",
            "pulumi-aws": ">=3.30.0,<4.0.0"
        }
    }
}
```
---

For the Go SDK, dependencies are specified in the `sdk/go.mod` file.

### Implementation

The implementation of this component is in `provider/cmd/pulumi-resource-xyz/staticPage.ts` and the structure of the component's inputs and outputs aligns with what is defined in `schema.json`:

---
```ts
export interface StaticPageArgs {
    indexContent: pulumi.Input<string>;
}

export class StaticPage extends pulumi.ComponentResource {
    public readonly bucket: aws.s3.Bucket;
    public readonly websiteUrl: pulumi.Output<string>;

    constructor(name: string, args: StaticPageArgs, opts?: pulumi.ComponentResourceOptions) {
        super("xyz:index:StaticPage", name, args, opts);

        ...
    }
}
```
---

The provider makes this component resource available in the `construct` method in `provider/cmd/pulumi-resource-xyz/provider.ts`. When `construct` is called and the `type` argument is `xyz:index:StaticPage`, we create an instance of the `StaticPage` component resource and return its `URN` and outputs as its state.


---
```ts
async function constructStaticPage(name: string, inputs: pulumi.Inputs,
    options: pulumi.ComponentResourceOptions): Promise<provider.ConstructResult> {

    // Create the component resource.
    const staticPage = new StaticPage(name, inputs as StaticPageArgs, options);

    // Return the component resource's URN and outputs as its state.
    return {
        urn: staticPage.urn,
        state: {
            bucket: staticPage.bucket,
            websiteUrl: staticPage.websiteUrl,
        },
    };
}
```
---
