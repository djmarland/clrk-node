"use strict";

// Pagination helper

module.exports = function() {

    var Paginator = function(
        perPage,
        page,
        req,
        total
    ) {
        page = parseInt(page,10) || 1;
        perPage = perPage || 10;
        total = total || 0;

        function pathForPage(page) {
            var path = req.path,
                query = req.query,
                parts = [],
                part,
                qs = '';

            // throw away any previous page number params
            delete query.page;

            if (page > 1) {
                query.page = page;
            }

            for (part in query) {
                parts.push(part + '=' + query[part]);
            }

            if (parts.length > 0) {
                parts.sort();
                qs = parts.join('&');
                qs = '?' + qs;
            }

            return path + qs;
        }

        return {
            currentPage : page,
            perPage : perPage,
            totalCount : total,
            totalPages : 1,
            listOffset : 1,
            listOffsetEnd : perPage - 1,
            previousPage : false,
            hasPagination : false,
            nextPage : false,
            finalise : function(total) {
                var i,
                    displayOffset = 2,
                    spacer = '...';
                this.totalCount = total;
                this.listOffset = (this.perPage * (this.currentPage-1)) + 1;
                this.listOffsetEnd = (this.listOffset + this.perPage) - 1;
                if (this.listOffsetEnd > this.totalCount) {
                    this.listOffsetEnd = this.totalCount;
                }
                this.totalPages = Math.ceil(this.totalCount / this.perPage);
                this.hasPagination = this.totalPages > 1;
                if (this.currentPage > 1) {
                    this.previousPage = pathForPage(this.currentPage - 1);
                }
                if (this.currentPage < this.totalPages) {
                    this.nextPage = pathForPage(this.currentPage + 1);
                }
                this.visiblePages = [
                    {
                        label : 1,
                        state : (this.currentPage == 1) ? 'pg__current' : null,
                        href : (this.currentPage == 1) ? null : pathForPage(1)
                    }
                ];
                for (i=2;i<this.totalPages;i++) {
                    if (
                        i >= (this.currentPage - displayOffset) &&
                        i <= (this.currentPage + displayOffset)) {
                        this.visiblePages.push({
                            label : i,
                            href : (this.currentPage == i) ? null : pathForPage(i),
                            state : (this.currentPage == i) ? 'pg__current' : null
                        });
                    } else if (i == 2) {
                        if ((this.currentPage - displayOffset == 3)) {
                            this.visiblePages.push({
                                label : i,
                                href : pathForPage(i),
                                state : null
                            });
                        } else {
                            this.visiblePages.push({
                                label : spacer,
                                href : null,
                                state : 'pg__spacer'
                            });
                        }
                    } else if (i == (this.totalPages-1)) {
                        if ((this.currentPage + displayOffset) == (this.totalPages-2)) {
                            this.visiblePages.push({
                                label : i,
                                href : pathForPage(i),
                                state : null
                            });
                        } else {
                            this.visiblePages.push({
                                label : spacer,
                                href : null,
                                state : 'pg__spacer'
                            });
                        }
                    }
                }
                if (this.totalPages > 1) {
                    this.visiblePages.push({
                        label: this.totalPages,
                        href: (this.currentPage == this.totalPages) ? null : pathForPage(this.totalPages),
                        state: (this.currentPage == this.totalPages) ? 'pg__current' : null
                    });
                }
            },
            isOutOfRange : function() {
                // only out of range if you asked for a page size greater than 1
                // and that means more than the total
                return ((this.currentPage > 1) && (this.currentPage > this.totalPages));
            }
        }
    };


    return {
        offset: function (perPage, page) {
            return (page - 1) * perPage;
        },
        setup: function(
            perPage,
            req
        ) {
            var query = req.query || null,
                page = query.page || 1;

            perPage = perPage || 10;

            return new Paginator(
                perPage,
                page,
                req
            )
        }
    }
};