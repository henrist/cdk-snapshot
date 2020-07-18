# CDK snapshot

Create a snapshot friendly version of a
[CDK](https://github.com/aws/aws-cdk)
[Cloud Assembly](https://github.com/aws/aws-cdk/blob/master/packages/@aws-cdk/cloud-assembly-schema/README.md)
that can be commited as part of the source code. The goal is to have
better control over structural stack changes before it is merged.

This can help automate the process of keeping CDK up-to-date while
manually approving structural stack changes. It also helps reviewing
code changes since the affected CloudFormation stack changes will be
reviewable as well.

## Usage

```bash
npm install @henrist/cdk-snapshot
```

Add run-script to `package.json`:

```json
{
  "scripts": {
    "cdk-snapshot": "rimraf cdk.out __snapshots__ && IS_SNAPSHOT=true npm run cdk -- synth && cdk-snapshot"
  }
}
```

Setting `IS_SNAPSHOT` means we can add conditionals in the
code to stub some parts of the templates during snapshot mode.
It is not needed for normal use.

Updated snapshot can now be created by running the script:

```bash
npm run cdk-snapshot
```

By default the `cdk-snapshot` script will take what it finds in
`cdk.out` directory and transform it to a snapshot friendly version that
it stores in `__snapshots__`.

### Asserting snapshot is up-to-date

In your CI/CD-pipeline you can add:

```bash
npm run cdk-snapshot
git status
git diff --exit-code
```

This will cause the build to fail if the snapshot is not up-to-date.

## In depth

A snapshot friendly version means an opinionated transformation of the
Cloud Assembly so that "innocent" changes does not always invalidate the
snapshot, to keep the maintenance burdon down.

The following is performed:

* The `cdk.out` file is removed. This only contains the version of
  the Cloud Manifest, which we think is not neccessary to keep track of.
* The `tree.json` file is removed. We think this does not contribute
  to the goal.
* The asset directories is removed. Asset changes are not kept track of,
  and should generally not invalidate the snapshot.
* The `manifest.json` file is modified to remove the Cloud Assemby version,
  runtime version informasjon (CDK library versions), trace output and
  asset details.
* From every template `*.template.json` the asset details is removed.

## Collapsing changes in PR by default

To make GitHub not show preview of changes to snapshots by default
in a PR, you can add this to the `.gitattributes` file:

```text
# See https://help.github.com/en/github/administering-a-repository/customizing-how-changed-files-appear-on-github
**/__snapshots__/** linguist-generated=true
```
