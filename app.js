const express = require('express');
const { Command } = require('commander');
const bodyParser = require('body-parser');

const app = express();
const program = new Command();
const notes = []; 

program
  .requiredOption('-h, --host <host>', 'server address')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cache>', 'path to the directory for cache');

program.parse(process.argv);
const options = program.opts();

if (!options.host || !options.port || !options.cache) {
  console.error('Error: all parameters --host, --port, and --cache are required.');
  process.exit(1);
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/notes/:noteName', (req, res) => {
  const note = notes.find(n => n.name === req.params.noteName);
  if (!note) {
    return res.status(404).send('Not found');
  }
  res.send(note.text);
});


app.put('/notes/:noteName', (req, res) => {
  const note = notes.find(n => n.name === req.params.noteName);
  if (!note) {
    return res.status(404).send('Not found');
  }
  note.text = req.body.text; 
  res.send('Note updated');
});


app.delete('/notes/:noteName', (req, res) => {
  const index = notes.findIndex(n => n.name === req.params.noteName);
  if (index === -1) {
    return res.status(404).send('Not found');
  }
  notes.splice(index, 1);
  res.send('Note deleted');
});


app.get('/notes', (req, res) => {
  res.json(notes);
});


app.post('/write', (req, res) => {
  const { note_name, note } = req.body;
  const existingNote = notes.find(n => n.name === note_name);
  if (existingNote) {
    return res.status(400).send('Bad Request');
  }
  notes.push({ name: note_name, text: note });
  res.status(201).send('Created');
});


app.get('/UploadForm.html', (req, res) => {
  res.send(`
    <form action="/write" method="post">
      <label for="note_name">Note Name:</label>
      <input type="text" name="note_name" required>
      <label for="note">Note:</label>
      <textarea name="note" required></textarea>
      <button type="submit">Submit</button>
    </form>
  `);
});


app.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
