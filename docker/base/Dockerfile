FROM ubuntu:14.04
# @see https://hub.docker.com/r/nickistre/ubuntu-lamp/~/dockerfile/
# 最好先下载到本地，docker pull ubuntu:14.04
# 然后此images的tags为my-ubuntu-:14.04
# docker run --name share_volume -v /Users/:/www/ -d my-ubuntu:14.04
MAINTAINER ao

# 中文乱码，（无用）
# ENV LANG zh_CN.UTF-8


# 修改软件源   @see http://wiki.ubuntu.org.cn/%E6%BA%90%E5%88%97%E8%A1%A8 ，看好对应版本，并在本机ping过
COPY ./sources.list /etc/apt/sources.list


# rm是解决apt-get报错，如果还是运行失败就多运行几次
RUN sudo rm -rf /etc/apt/sources.list.d/ \
	&& sudo rm -rf /var/lib/apt/lists/partial/ \
    && apt update \
    && apt install -y --no-install-recommends \
        gcc \
        make \
        g++ \
		libssl-dev \
    	curl \
        vim \
        libxml2 \
    && rm -rf /var/lib/apt/lists/*
