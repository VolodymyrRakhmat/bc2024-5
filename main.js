const { program } = require("commander");
const express = require('express');
const path = require('path');
const fs = require('fs');

program
  .requiredOption("-H, --host <host>", "server host")
  .requiredOption("-p, --port <port>", "server port")
  .requiredOption("-c, --cache <path>", "cache directory path")
  .parse(process.argv);

const { host, port, cache } = program.opts();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cachePath = path.resolve(cache);
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});


app.get('/notes/:noteName', (req, res) => {
    const notePath = path.join(cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }

    const noteText = fs.readFileSync(notePath, 'utf8');
    res.send(noteText);
});

app.put('/notes/:noteName', (req, res) => {
    const notePath = path.join(cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    const newText = req.body.text;
    if (newText === undefined) {
        return res.status(400).send('Text is required');
    }
    fs.writeFileSync(notePath, newText);
    res.send('Note updated');
});

app.delete('/notes/:noteName', (req, res) => {
    const notePath = path.join(cache, req.params.noteName);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }

    fs.unlinkSync(notePath);
    res.send('Note deleted');
});

app.get('/notes', (req, res) => {
    const files = fs.readdirSync(cache);
    const notes = files.map(fileName => {
        const text = fs.readFileSync(path.join(cache, fileName), 'utf8');
        return { name: fileName, text };
    });

    res.json(notes);
});

app.post('/write', (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    if (!noteName || !noteText) {
        return res.status(400).send('Note name and text are required');
    }

    const notePath = path.join(cache, noteName);

    if (fs.existsSync(notePath)) {
        return res.status(400).send('Note already exists');
    }

    try {
        fs.writeFileSync(notePath, noteText, 'utf8');
        res.status(201).send('Note created');
    } catch (error) {
        console.error('Error writing note:', error);
        res.status(500).send('Error creating note');
    }
});

app.get('/UploadForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'UploadForm.html'));
});