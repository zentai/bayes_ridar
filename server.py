from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from empiricaldist import Pmf
import os

app = Flask(__name__, static_folder=os.path.join(os.getcwd(), "static"))
CORS(app)  # Enable Cross-Origin Resource Sharing to allow requests from your frontend

# Global variables to manage grid data
posterior_pmf = None
grid_size = 0


@app.route("/set-grid", methods=["POST"])
def set_grid():
    global grid_size, posterior_pmf
    data = request.get_json()
    grid_size = data.get("grid_size", 10)

    # Initialize the PMF for the grid, setting an equal probability for each cell
    total_cells = grid_size * grid_size
    posterior_pmf = Pmf.from_seq(range(total_cells))

    return jsonify({"message": "Grid initialized", "grid_size": grid_size})


@app.route("/update-likelihood", methods=["POST"])
def update_likelihood():
    global posterior_pmf
    data = request.get_json()

    # Update likelihoods based on user-selected cells
    for likelihood_str, cells in data.items():
        print(likelihood_str, cells)
        likelihood = float(likelihood_str)
        for cell_id in cells:
            posterior_pmf[cell_id] *= likelihood

    # Normalize the PMF
    posterior_pmf.normalize()

    return jsonify(
        {"message": "Likelihood updated successfully", "ps": list(posterior_pmf.ps)}
    )


@app.route("/")
def serve_index():
    return send_from_directory(app.root_path, "index.html")

@app.route("/ls")
def local_storage():
    return send_from_directory(app.root_path, "localstorage.html")


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(os.path.join(app.root_path, "static"), filename)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
