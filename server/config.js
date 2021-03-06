const convict = require('convict');
const { tmpdir } = require('os');
const path = require('path');
const { randomBytes } = require('crypto');

const passwordConvict = convict({
  maxLength: {
    type: {
      format: ['maxLength']
    },
    length: {
      doc: 'the maximum length allowed for passwords',
      format: Number,
      default: 32
    }
  },
  minLength: {
    type: {
      format: ['minLength']
    },
    length: {
      doc: 'the minimum length allowed for passwords',
      format: Number,
      default: 32
    }
  },
  containsNumbers: {
    type: {
      format: ['containsNumbers']
    },
    count: {
      doc: 'how many numbers must be present in the password',
      format: Number,
      default: 1
    }
  },
  containsSpecials: {
    type: {
      format: ['containsSpecials']
    },
    count: {
      doc: 'how many special characters must be present',
      format: Number,
      default: 1
    }
  }
});

convict.addFormat({
  name: 'password-requirements-array',
  validate: function(requirements, _) {
    if (!Array.isArray(requirements)) {
      throw new Error('must be of type Array');
    }

    for (var requirement of requirements) {
      passwordConvict.load(requirement).validate();
    }
  }
});

const conf = convict({
  password_requirements_list: {
    format: 'password-requirements-array',
    doc: 'list of requirements for valid passwords',
    default: []
  },
  password_required: {
    format: Boolean,
    default: false,
    env: 'PASSWORD_REQUIRED'
  },
  s3_bucket: {
    format: String,
    default: '',
    env: 'S3_BUCKET'
  },
  gcs_bucket: {
    format: String,
    default: '',
    env: 'GCS_BUCKET'
  },
  expire_times_seconds: {
    format: Array,
    default: [300, 3600, 86400, 604800],
    env: 'EXPIRE_TIMES_SECONDS'
  },
  default_expire_seconds: {
    format: Number,
    default: 86400,
    env: 'DEFAULT_EXPIRE_SECONDS'
  },
  max_expire_seconds: {
    format: Number,
    default: 86400 * 7,
    env: 'MAX_EXPIRE_SECONDS'
  },
  anon_max_expire_seconds: {
    format: Number,
    default: 86400,
    env: 'ANON_MAX_EXPIRE_SECONDS'
  },
  download_counts: {
    format: Array,
    default: [1, 2, 3, 4, 5, 20, 50, 100],
    env: 'DOWNLOAD_COUNTS'
  },
  max_downloads: {
    format: Number,
    default: 100,
    env: 'MAX_DOWNLOADS'
  },
  anon_max_downloads: {
    format: Number,
    default: 5,
    env: 'ANON_MAX_DOWNLOADS'
  },
  max_files_per_archive: {
    format: Number,
    default: 64,
    env: 'MAX_FILES_PER_ARCHIVE'
  },
  max_archives_per_user: {
    format: Number,
    default: 16,
    env: 'MAX_ARCHIVES_PER_USER'
  },
  redis_host: {
    format: String,
    default: 'localhost',
    env: 'REDIS_HOST'
  },
  redis_event_expire: {
    format: Boolean,
    default: false,
    env: 'REDIS_EVENT_EXPIRE'
  },
  listen_address: {
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'IP_ADDRESS'
  },
  listen_port: {
    format: 'port',
    default: 1443,
    arg: 'port',
    env: 'PORT'
  },
  amplitude_id: {
    format: String,
    default: '',
    env: 'AMPLITUDE_ID'
  },
  analytics_id: {
    format: String,
    default: '',
    env: 'GOOGLE_ANALYTICS_ID'
  },
  sentry_id: {
    format: String,
    default: '',
    env: 'SENTRY_CLIENT'
  },
  sentry_dsn: {
    format: String,
    default: '',
    env: 'SENTRY_DSN'
  },
  env: {
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  max_file_size: {
    format: Number,
    default: 1024 * 1024 * 1024 * 2.5,
    env: 'MAX_FILE_SIZE'
  },
  anon_max_file_size: {
    format: Number,
    default: 1024 * 1024 * 1024,
    env: 'ANON_MAX_FILE_SIZE'
  },
  l10n_dev: {
    format: Boolean,
    default: false,
    env: 'L10N_DEV'
  },
  base_url: {
    format: 'url',
    default: 'https://send.firefox.com',
    env: 'BASE_URL'
  },
  file_dir: {
    format: 'String',
    default: `${tmpdir()}${path.sep}send-${randomBytes(4).toString('hex')}`,
    env: 'FILE_DIR'
  },
  fxa_url: {
    format: 'url',
    default: 'https://send-fxa.dev.lcip.org',
    env: 'FXA_URL'
  },
  fxa_client_id: {
    format: String,
    default: '', // disabled
    env: 'FXA_CLIENT_ID'
  },
  fxa_key_scope: {
    format: String,
    default: 'https://identity.mozilla.com/apps/send',
    env: 'FXA_KEY_SCOPE'
  },
  survey_url: {
    format: String,
    default: '',
    env: 'SURVEY_URL'
  },
  ip_db: {
    format: String,
    default: '',
    env: 'IP_DB'
  },
  log_format: {
    format: String,
    default: 'common',
    env: 'LOG_FORMAT'
  },
  statsd_host: {
    format: String,
    default: 'localhost',
    env: 'STATSD_HOST'
  },
  statsd_port: {
    format: 'port',
    default: 8125,
    env: 'STATSD_PORT'
  },
  statsd_prefix: {
    format: String,
    default: 'sendr',
    env: 'STATSD_PREFIX'
  }
});

// Perform validation
conf.loadFile(path.resolve(__dirname, 'config.json'));
conf.validate({ allowed: 'strict' });

const props = conf.getProperties();
module.exports = props;
