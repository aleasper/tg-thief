# TG-THIEF

### How to run
1. Fist build docker
```sh
docker-compose build
```
2. Run in detached mode
```sh
docker-compose up -d
```
3. Attach to downloader for entering code (replace with actual name). Hit `Enter` to make stgin alive and enter credentials
```sh
docker attach tg-thief_downloader_1
```

4. To exit from attached mode use `ctrl+p` and after `ctrl+q`