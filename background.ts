import { Storage } from "@plasmohq/storage"

async function testBaseStorage() {
  const storage = new Storage()
  await storage.clear()

  storage.watch({
    hello: (c) => {
      console.log("hello", c)
    },
    "serial-number": (c) => {
      console.log("serial-number", c)
    },
    make: (c) => {
      console.log("make", c)
    }
  })

  await storage.set("hello", 1)
  await storage.set("serial-number", 1701)
  await storage.set("make", "plasmo-corp")

  // The storage.set promise apparently resolves before the watch listener is registered...
  // So we need to wait a bit before adding the next watch if we want to split the watchers. Otherwise, the second watch will get the first set of change as well.
  await new Promise((resolve) => setTimeout(resolve, 470))

  storage.watch({
    make: (c) => {
      console.log("watch make 2", c)
    }
  })

  await storage.set("hello", 2)
  await storage.set("serial-number", 8451)
  await storage.set("make", "PlasmoHQ")
}

const main = async () => {
  await testBaseStorage()
}

main()
