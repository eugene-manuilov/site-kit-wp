ARG WP_IMAGE=wordpress:latest

FROM $WP_IMAGE

ENV WORDPRESS_DB_HOST="mysql"
ENV WORDPRESS_DB_NAME="wordpress_test"
ENV WORDPRESS_DB_USER="wordpress"
ENV WORDPRESS_DB_PASSWORD="password"
ENV WORDPRESS_DEBUG=1
ENV WORDPRESS_CONFIG_EXTRA="define( 'SCRIPT_DEBUG', true );"

COPY ./tests/e2e/mu-plugins /var/www/html/wp-content/mu-plugins
COPY ./tests/e2e/plugins /var/www/html/wp-content/plugins

RUN apt-get update \
    && apt-get install -y mysql-client \
    && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp \
    && wp --info
