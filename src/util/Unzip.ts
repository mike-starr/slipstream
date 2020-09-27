import fs from "fs";
import path from "path";
import yauzl from "yauzl";
import stream from "stream";
import util from "util";

const streamPipeline = util.promisify(stream.pipeline);

export async function unzipToDirectory(
  sourceFilename: string,
  destinationDirectory: string,
  deleteAfterUnzipping: boolean
) {
  return new Promise((resolve, reject) => {
    yauzl.open(sourceFilename, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
      }

      zipfile!.on("entry", (entry) => {
        if (/\/$/.test(entry.fileName)) {
          zipfile!.readEntry();
        } else {
          zipfile!.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err);
            }

            const outputPath = path.join(destinationDirectory, entry.fileName);

            fs.promises
              .mkdir(path.dirname(outputPath), { recursive: true })
              .then(() => {
                return streamPipeline(
                  readStream!,
                  fs.createWriteStream(outputPath)
                );
              })
              .then(() => {
                zipfile!.readEntry();
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          });
        }
      });

      zipfile!.on("error", (error) => {
        reject(error);
      });

      zipfile!.on("end", () => {
        resolve();
      });

      zipfile!.on("close", () => {
        if (deleteAfterUnzipping) {
          fs.promises.unlink(sourceFilename);
        }
      });

      zipfile!.readEntry();
    });
  });
}
