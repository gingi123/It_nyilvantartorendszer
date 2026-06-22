const ListControls = ({
    pageSize,
    onPageSizeChange,
    search,
    onSearchChange
}) => {
    return (
        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
            <input
                data-testid="search-bar-input"
                type="text"
                className="form-control"
                placeholder="Keresés..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <select
                data-testid="page-size-select"
                className="form-select w-auto"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
                <option value={5}>5 / oldal</option>
                <option value={10}>10 / oldal</option>
                <option value={20}>20 / oldal</option>
                <option value={50}>50 / oldal</option>
            </select>
        </div>
    );
};

export default ListControls;