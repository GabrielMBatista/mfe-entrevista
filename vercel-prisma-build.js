import fs from 'fs';

async function main() {
    // ✅ 1. Cria um .npmrc temporário com o token de ambiente
    const token = process.env.GITHUB_PACKAGES_TOKEN;
    if (!token) {
        console.error('❌ GITHUB_PACKAGES_TOKEN não definido no ambiente!');
        process.exit(1);
    }

    const npmrcContent = `
@gabrielmbatista:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${token}
`;

    fs.writeFileSync('.npmrc', npmrcContent.trim());
    console.log('✅ .npmrc criado com sucesso');

    // ✅ 3. Remove .npmrc temporário após o build (opcional)
    if (fs.existsSync('.npmrc')) {
        fs.unlinkSync('.npmrc');
        console.log('✅ .npmrc removido após o build');
    }
}

main();
