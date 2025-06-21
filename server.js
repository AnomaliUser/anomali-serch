
const express = require("express");
const multer = require("multer");
const path = require("path");
const FormData = require("form-data");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, ".")));

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", req.file.buffer, "image.jpg");

    const catbox = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form
    });

    const url = (await catbox.text()).trim();
    const encoded = encodeURIComponent(url);
    const nsfw = req.body.nsfw === "true";

    const links = [
      { name: "SauceNAO", url: `https://saucenao.com/search.php?url=${encoded}` },
      { name: "trace.moe", url: `https://trace.moe/?url=${encoded}` },
      { name: "IQDB", url: `https://iqdb.org/?url=${encoded}` },
      { name: "ascii2d", url: `https://ascii2d.net/search/url/${encoded}` },
      { name: "Google", url: `https://lens.google.com/uploadbyurl?url=${encoded}` },
      { name: "Yandex", url: `https://yandex.com/images/search?rpt=imageview&url=${encoded}` }
    ];

    if (nsfw) {
      links.push(
        { name: "Gelbooru", url: `https://gelbooru.com/index.php?page=post&s=list&tags=source:${encoded}` },
        { name: "Sankaku", url: `https://chan.sankakucomplex.com/?tags=source:${encoded}` },
        { name: "E-shuushuu", url: `https://e-shuushuu.net/search/results/?image_url=${encoded}` }
      );
    }

    res.json({ links });
  } catch (err) {
    console.error("Erreur:", err);
    res.status(500).json({ error: "Erreur d'upload." });
  }
});

app.listen(PORT, () => console.log("AnomaliSerch en ligne sur port " + PORT));
