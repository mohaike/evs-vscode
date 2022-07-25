CURRENT_PATH="$(cd $(dirname ${BASH_SOURCE:-$0});pwd)"
tmp_file="${CURRENT_PATH}/__tmp_v"

clean()
{
    if [ -f "${tmp_file}" ]
    then
        rm -rf "${tmp_file}"
    fi
}

evs_version=""
get_version()
{
    clean
    jq '.version' "${CURRENT_PATH}/package.json" > "${tmp_file}"
    sed 's/\"//g' "${tmp_file}"
}
evs_version="$(get_version)"

bak_evs()
{
    # 拷贝到备份目录
    echo "拷贝到备份目录"
    cp "${CURRENT_PATH}/evs-${evs_version}.vsix" "$HOME/.emacs.d/vscode-extension/evs-${evs_version}.vsix"
    cd "$HOME/.emacs.d"
    git add "$HOME/.emacs.d/vscode-extension"
    git commit -m "更新EVS $(date +"%Y-%m-%d %H:%M:%S")"
    cd -
}

re_install_evs()
{
    # 重新安装EVS
    echo "重新安装EVS"
    code --uninstall-extension momo.evs
    code --install-extension "${CURRENT_PATH}/evs-${evs_version}.vsix"
}

go()
{
    cd "${CURRENT_PATH}"
    echo "用vsce打包，没有需要自己安装"
    vsce package

    bak_evs
    re_install_evs
    clean
}
go
