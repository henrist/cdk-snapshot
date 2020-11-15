import * as execa from "execa"
import * as fs from "fs"
import * as rimraf from "rimraf"
import { createCloudAssemblySnapshot } from "./index"
import {
  prepareManifestForSnapshot,
  prepareTemplateForSnapshot,
} from "./snapshot"

async function rm(path: string): Promise<void> {
  return new Promise((resolve) => void rimraf(path, {}, () => resolve()))
}

describe("A current application", () => {
  beforeAll(async () => {
    await rm("cdk.out")
    await execa("npm", ["run", "cdk", "--", "synth"])
  }, 30000)

  test("Snapshots should be creatable from CLI", async () => {
    await rm("cdk.out.test")
    await execa("node", [
      "./lib/bin/cdk-snapshot.js",
      "cdk.out",
      "cdk.out.test",
    ])

    const files = fs.readdirSync("cdk.out.test", "utf-8").sort()
    expect(files).toMatchInlineSnapshot(`
      Array [
        "manifest.json",
        "stack-1.template.json",
      ]
    `)
  }, 30000)

  describe("For a given snapshot", () => {
    beforeAll(async () => {
      await rm("cdk.out.test")
      await createCloudAssemblySnapshot("cdk.out", "cdk.out.test")
    })

    // To catch any future change in behaviour.
    test("the cdk.out file should only contain version", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const content = JSON.parse(fs.readFileSync("cdk.out/cdk.out", "utf-8"))
      expect(content).toEqual({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        version: expect.any(String),
      })
    })

    test("cdk.out version file should be removed", () => {
      expect(fs.existsSync("cdk.out/cdk.out")).toBe(true)
      expect(fs.existsSync("cdk.out.test/cdk.out")).toBe(false)
    })

    test("tree.json should be removed", () => {
      expect(fs.existsSync("cdk.out/tree.json")).toBe(true)
      expect(fs.existsSync("cdk.out.test/tree.json")).toBe(false)
    })

    test("Asset directory should be removed", () => {
      const filesBefore = fs.readdirSync("cdk.out", "utf-8").sort()
      expect(filesBefore).toEqual(
        expect.arrayContaining([expect.stringContaining("asset")]),
      )

      const filesAfter = fs.readdirSync("cdk.out.test", "utf-8").sort()
      expect(filesAfter).toEqual(
        expect.not.arrayContaining([expect.stringContaining("asset")]),
      )
    })

    test("Output directory should have expected files", () => {
      const files = fs.readdirSync("cdk.out.test", "utf-8").sort()
      expect(files).toMatchInlineSnapshot(`
      Array [
        "manifest.json",
        "stack-1.template.json",
      ]
    `)
    })

    describe("Manifest file", () => {
      let before: string
      let after: string

      beforeAll(() => {
        before = fs.readFileSync("cdk.out/manifest.json", "utf-8")
        after = fs.readFileSync("cdk.out.test/manifest.json", "utf-8")
      })

      test("Version should be removed", () => {
        expect(before).toContain('"version"')
        expect(after).not.toContain('"version"')
      })

      test("No runtime information", () => {
        expect(before).not.toContain('"runtime":')
        expect(after).not.toContain('"runtime":')
      })

      test("Trace should be removed", () => {
        expect(before).toContain('"trace"')
        expect(after).not.toContain('"trace"')
      })

      test("Asset hashes should be removed", () => {
        expect(before).toContain("AssetParameters")
        expect(after).not.toContain("AssetParameters")
      })

      test("It should still contain resource information", () => {
        expect(after).toContain('"MyFunctionServiceRole3C357FF2"')
      })

      test("It should match previous snapshot", () => {
        expect(after).toMatchSnapshot()
      })
    })

    describe("Template file", () => {
      let before: string
      let after: string

      beforeAll(() => {
        before = fs.readFileSync("cdk.out/stack-1.template.json", "utf-8")
        after = fs.readFileSync("cdk.out.test/stack-1.template.json", "utf-8")
      })

      test("Asset hashes should be removed", () => {
        expect(before).toContain("AssetParameters")
        expect(after).not.toContain("AssetParameters")
      })

      test("It should match previous snapshot", () => {
        expect(after).toMatchSnapshot()
      })
    })
  })
})

describe("Files from a v5 Cloud Assembly", () => {
  describe("Manifest file", () => {
    let before: string
    let after: string

    beforeAll(() => {
      before = fs.readFileSync(
        "src/__test_assets__/cloud-assembly-v5/manifest.json",
        "utf-8",
      )
      after = prepareManifestForSnapshot(before)
    })

    test("Version should be removed", () => {
      expect(before).toContain('"version"')
      expect(after).not.toContain('"version"')
    })

    test("Runtime information should be removed", () => {
      expect(before).toContain('"runtime": {\n')
      expect(after).toContain('"runtime": {}')
    })

    test("Trace should be removed", () => {
      expect(before).toContain('"trace"')
      expect(after).not.toContain('"trace"')
    })

    test("Asset hashes should be removed", () => {
      expect(before).toContain("AssetParameters")
      expect(after).not.toContain("AssetParameters")
    })

    test("It should still contain resource information", () => {
      expect(after).toContain('"MyFunctionServiceRole3C357FF2"')
    })

    test("It should match previous snapshot", () => {
      expect(after).toMatchSnapshot()
    })
  })

  describe("Template file", () => {
    let before: string
    let after: string

    beforeAll(() => {
      before = fs.readFileSync(
        "src/__test_assets__/cloud-assembly-v5/stack-1.template.json",
        "utf-8",
      )
      after = prepareTemplateForSnapshot(before)
    })

    test("Asset hashes should be removed", () => {
      expect(before).toContain("AssetParameters")
      expect(after).not.toContain("AssetParameters")
    })

    test("It should match previous snapshot", () => {
      expect(after).toMatchSnapshot()
    })
  })
})

describe("Files from a v7 Cloud Assembly", () => {
  describe("Manifest file", () => {
    let before: string
    let after: string

    beforeAll(() => {
      before = fs.readFileSync(
        "src/__test_assets__/cloud-assembly-v7/manifest.json",
        "utf-8",
      )
      after = prepareManifestForSnapshot(before)
    })

    test("Version should be removed", () => {
      expect(before).toContain('"version"')
      expect(after).not.toContain('"version"')
    })

    test("No runtime information", () => {
      expect(before).not.toContain('"runtime":')
      expect(after).not.toContain('"runtime":')
    })

    test("Trace should be removed", () => {
      expect(before).toContain('"trace"')
      expect(after).not.toContain('"trace"')
    })

    test("Asset hashes should be removed", () => {
      expect(before).toContain("AssetParameters")
      expect(after).not.toContain("AssetParameters")
    })

    test("It should still contain resource information", () => {
      expect(after).toContain('"MyFunctionServiceRole3C357FF2"')
    })

    test("It should match previous snapshot", () => {
      expect(after).toMatchSnapshot()
    })
  })

  describe("Template file", () => {
    let before: string
    let after: string

    beforeAll(() => {
      before = fs.readFileSync(
        "src/__test_assets__/cloud-assembly-v7/stack-1.template.json",
        "utf-8",
      )
      after = prepareTemplateForSnapshot(before)
    })

    test("Asset hashes should be removed", () => {
      expect(before).toContain("AssetParameters")
      expect(after).not.toContain("AssetParameters")
    })

    test("It should match previous snapshot", () => {
      expect(after).toMatchSnapshot()
    })
  })
})
