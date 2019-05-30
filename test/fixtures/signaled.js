require('../..')(module, { $trap: { SIGINT: 'default' } }, async arguable => await arguable.destroyed)
