FROM php:8.1-fpm

# Install mongo extension
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN apt-get update && apt-get install -y \
    git

WORKDIR /app

