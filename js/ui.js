document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('.modal');
        let modalOpts = {
            dismissible: true,
            startingTop: '10vh',
            inDuration: 350,
            outDuration: 200
        };

        let modal = M.Modal.init(elems, modalOpts);
        modal = modal[0];

        var date = document.querySelectorAll('.datepicker');
        let dateOpts = {
            format: "yyyy,mm,dd",
            container: 'body'
        };

        var dates = M.Datepicker.init(date, dateOpts);
        dates = dates[0];

  });


          