const router = require('express').Router();
const { fetchProvinsi,fetchKabuaten,fetchKecamatan,fetchKelurahan } = require('./controller');


router.get('/addressprov', fetchProvinsi);
router.get('/addresskab/:provinceCode', fetchKabuaten);
router.get('/addresskec/:regenciesCode', fetchKecamatan);
router.get('/addresskel/:districtsCode', fetchKelurahan);

module.exports = router;