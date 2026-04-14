/*
 * ------------------------ *
 * -----  gulpfile.js ----- *
 * ------------------------ *
*/



import { deleteAsync } from "del";
import { src, dest, series, parallel } from 'gulp';
import terser from 'gulp-terser';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import { Transform } from 'stream';
import plumber from 'gulp-plumber';
import fs from 'fs';



/**
 * - Desestructura el objeto `paths` para acceder a las rutas de los archivos.
 * @typedef { Object } paths - Objeto con las rutas de los archivos.
 * @property { string } js - Ruta de los archivos JavaScript.
 * @property { string } css - Ruta de los archivos CSS.
 * @property { string } html - Ruta de los archivos HTML.
 * @property { string } img - Ruta de las imágenes.
 * @property { string } data - Ruta de los archivos JSON.
 */



/** @type { paths } - `Objeto con las rutas de los archivos` */
const paths = {
    js: 'assets/js/**/*.js',
    css: 'assets/css/**/*.css',
    html: '*.html',
    img: 'assets/img/**/*',
    data: 'assets/data/**/*.json'
};


//  -----  `Desestructuración de rutas`  -----
const { js, css, html, img, data } = paths;



/**
 * ---------------------------
 * -----  `cleanDist()`  -----
 * ---------------------------
 * - Elimina la carpeta dist/ y su contenido.
 */

export const cleanDist = () => deleteAsync(['dist']);



/**
 * ---------------------------
 * -----  `safePipe()`  ------
 * ---------------------------
 * - Evita que Gulp se detenga ante errores en las tareas.
 */

const safePipe = () => plumber({
    errorHandler: function (err) {
        console.error(err.message);
        this.emit('end');
    }
});



/**
 * ------------------------------
 * -----  `minifyJsTask()`  -----
 * ------------------------------
 * - Minifica los archivos JavaScript.
 * @param { () => void } done - Función callback que indica que la tarea ha finalizado.
 */

export const minifyJsTask = (done) => {

    if (!fs.existsSync('assets/js'))
        return done();

    return src(js, { allowEmpty: true })
        .pipe(safePipe())
        .pipe(terser({ toplevel: true }))
        .pipe(dest('dist/assets/js'));
};



/**
 * -------------------------------
 * -----  `minifyCssTask()`  -----
 * -------------------------------
 * - Minifica los archivos CSS.
 * @param { () => void } done - Función callback que indica que la tarea ha finalizado.
 */

export const minifyCssTask = (done) => {

    if (!fs.existsSync('assets/css'))
        return done();

    return src(css, { allowEmpty: true })
        .pipe(safePipe())
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(dest('dist/assets/css'));
};



/**
 * --------------------------------
 * -----  `minifyHtmlTask()`  -----
 * --------------------------------
 * - Minifica los archivos HTML.
 */

export const minifyHtmlTask = () =>

    src(html, { allowEmpty: true })
        .pipe(safePipe())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeOptionalTags: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(dest('dist'));



/**
 * ----------------------------
 * -----  `minifyJson()`  -----
 * ----------------------------
 * - Minifica los archivos JSON.
 */

const minifyJson = () => new Transform({
    objectMode: true,
    transform(file, encoding, callback) {

        if (file.isNull() || file.isStream())
            return callback(null, file);

        try {
            const data = JSON.parse(file.contents.toString());
            file.contents = Buffer.from(JSON.stringify(data));
            callback(null, file);
        } catch (err) {
            console.warn('JSON inválido:', file.path);
            callback(null, file); // no rompe build
        }
    }
});



/**
 * --------------------------
 * -----  `dataTask()`  -----
 * --------------------------
 * - Copia los archivos JSON de datos.
 * - allowEmpty: true permite que la tarea se ejecute incluso si no hay archivos JSON.  
 * @param { () => void } done - Función callback que indica que la tarea ha finalizado.
 */

export const dataTask = (done) => {

    if (!fs.existsSync('assets/data')) {
        return done();
    }

    return src(data, { allowEmpty: true })
        .pipe(safePipe())
        .pipe(minifyJson())
        .pipe(dest('dist/assets/data'));
};



/**
 * -----------------------------
 * -----  `copyImgTask()`  -----
 * -----------------------------
 * - Copia las imágenes y SVG (incluyendo el favicon).
 * @param { () => void } done - Función callback que indica que la tarea ha finalizado.
 */

export const copyImgTask = (done) => {

    if (!fs.existsSync('assets/img'))
        return done();

    return src(img, { allowEmpty: true, encoding: false })
        .pipe(safePipe())
        .pipe(dest('dist/assets/img'));
};



/**
 * -----------------------
 * -----  `build()`  -----
 * -----------------------   
 * - Ejecuta en serie la limpieza de la carpeta dist/
 * - Luego ejecuta en paralelo todas las tareas de optimización.
 */

export const build = series(
    cleanDist,
    parallel(
        minifyJsTask,
        minifyCssTask,
        minifyHtmlTask,
        copyImgTask,
        dataTask
    )
);
