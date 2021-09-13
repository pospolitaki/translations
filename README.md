# translations

## Description

---

<br>
A small script created as an attempt to make work with `react-intl` generated translation files a bit convenient <br>
<br>

## Installation

---

<br>
This package should be installed globally cause it provides an executable `translations` command that you can run from the shell (CLI), and it could be reused across projects: <br>
<br>

```
npm install -g translations-cli
```

<br>

## Usage

---

<br>

Let's say your project already supports Spanish language and uses [format.js](https://formatjs.io/) as an internationalization tool.<br>

So there are two JSON files in `src/languages` folder - one for English (`en.json`) and one for Spanish (`es.json`) locale:

```
src/languages
├── en.json
└── es.json

```

`es.json` content looks like:<br>

```
{
  "Home.home": "Inicio",
  "Login.login": "Iniciar Sesión",
  "Login.password": "Contraseña",
  ... and more 100 lines
}
```

And in your code you have [declared](https://formatjs.io/docs/getting-started/message-declaration) new messages to be translated:<br>

```
intl.formatMessage({ id: 'Home.home', defaultMessage: 'Home' })
```

After you have [extracted](https://formatjs.io/docs/getting-started/message-extraction) messages in some `src/languages/extracted-messages.json` file you got mix of previously and newly translated messages in it:

```
src/languages
├── en.json
├── es.json
└── extracted-messages.json

```

The `extracted-messages.json` now contains:

```
{
  "Home.home": {
    "defaultMessage": "Home",
    "description": "Home page title"
  },
  ... and 100 more lines
}
```

Now only newly declared messages (untranslated yet) have to be sent to your translation vendor.<br>
To get them you could write next command in you terminal:

```
translations get-from src/languages/extracted-messages.json --exclude src/languages/es.json
```

This command writes all the messages from `extracted-messages.json` which ids not in `es.json` file yet. If no output file explicitly provided with `-o` or `--output` flag - it will create `untranslated-messages.json` file in the same folder as the first command's argument (`src/languages`):

```
src/languages
├── en.json
├── es.json
├── extracted-messages.json
└── untranslated-messages.json

```

now the `untranslated-messages.json` contains:

```
{
  "Home.home": {
    "defaultMessage": "Home",
    "description": "Home page title"
  },
  ... and 20 more lines
}
```

Now you can send them to your translation vendor and they will give you back the translated `raw-fresh-es.json` JSON file of the same format:

```
{
  "Home.home": {
    "defaultMessage": "Inicio",
    "description": "Home page title"
  },
  ... and 20 more lines
}
```

You have to [compile](https://formatjs.io/docs/getting-started/message-distribution#compiling-messages) this into a `react-intl` consumable JSON file.<br>
So you compiled it into `fresh-es.json`:

```
src/languages
├── en.json
├── es.json
├── extracted-messages.json
├── fresh-es.json
└── untranslated-messages.json

```

The `fresh-es.json` contains:

```
{
  "Home.home": "Inicio",
  "Login.login": "Iniciar Sesión",
  "Login.email": "Dirección de E-mail",
  "Login.password": "Contraseña",
  ... and 17 more lines
}
```

After this you have to merge newly translated messages from the `fresh-es.json` into previously translated messages in the `es.json`.<br>
In this point you may have two scenarios:

1. add to `es.json` new messages only (new by `id` value) and preserve it from overriding messages with already existing `ids` but new `value` (e.g. if translations for message with corresponding `id` was changed in `fresh-es.json` recently).
2. to update all messages despite of the fact that the `id` already exists in the `es.json` and gonna be overridden with message from `fresh-es.json`.

So `es.json`:

```
{
  "Home.home": "Inicio",
  "Login.login": "Iniciar Sesión",
  "Login.password": "Contraseña",
  ... and 100 more lines
}
```

and `fresh-es.json`:

```
{
  "Home.home": "Página de inicio",
  "Login.login": "Iniciar Sesión",
  "Login.email": "Dirección de E-mail",
  "Login.password": "Contraseña",
  ... and 17 more lines
}
```

We can see that the message with `id` "Home.home" was modified and "Login.email" was added.<br>
Let's check next commands results.

1. Command:

```
translations update src/languages/es.json --with src/languages/fresh-es.json --action update-existing
```

1. `es.json`:

```
{
  "Home.home": "Página de inicio",
  "Login.login": "Iniciar Sesión",
  "Login.password": "Contraseña"
  ... and 100 more lines
}
```

2. Command:

```
translations update src/languages/es.json --with src/languages/fresh-es.json --action append-missing
```

2. `es.json`:

```
{
    "Home.home": "Inicio",
    "Login.login": "Iniciar Sesión",
    "Login.password": "Contraseña",
    "Login.email": "Dirección de E-mail"
    ... and 100 more lines
}
```

3. Command:

If `-a` (`--action`) flag wasn't provided explicitly:

```
translations update src/languages/es.json --with src/languages/fresh-es.json
```

it's the same as:

```
translations update src/languages/es.json --with src/languages/fresh-es.json --action update-all
```

3. `es.json`:

```
{
  "Home.home": "Página de inicio",
  "Login.login": "Iniciar Sesión",
  "Login.password": "Contraseña",
  "Login.email": "Dirección de E-mail"
  ... and 100 more lines
}
```

And finally manually clean up the `src/languages`:

```
src/languages
├── en.json
└── es.json

```
