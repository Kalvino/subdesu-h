set :application, "subdesu-h"
set :scm, :git
set :repository, "git@github.com:Kalvino/subdesu-h"

set :deploy_to, "/var/www/subdesu-h"

set :user, "calvino"

set :use_sudo, false

set :normalize_asset_timestamps, false

set :default_shell, "/bin/bash -l"

set :rvm_type, :system

