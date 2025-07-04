import { Request, Response } from 'express';
import { GetMarketsUseCase } from '../../../application/use-cases/GetMarketsUseCase';
import { GetMarketByIdUseCase } from '../../../application/use-cases/GetMarketByIdUseCase';
import { 
  MarketResponseDto, 
  MarketListResponseDto, 
  MarketErrorResponseDto,
  marketToDto,
  marketListToDto 
} from '../../../application/dto/MarketDto';
import { MarketFilters } from '../../../domain/entities/Market';
import { NotFoundError } from '../../../shared/errors/DomainError';

/**
 * @swagger
 * /v1/api/markets:
 *   get:
 *     summary: Get a list of markets
 *     description: Returns a list of markets with optional filters.
 *     tags:
 *       - Markets
 *     responses:
 *       200:
 *         description: List of markets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketListResponseDto'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketErrorResponseDto'
 */
export class MarketController {
  constructor(
    private getMarketsUseCase: GetMarketsUseCase,
    private getMarketByIdUseCase: GetMarketByIdUseCase
  ) {}

  async getMarkets(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const filters: MarketFilters = {};
      
      if (req.query['status']) {
        filters['status'] = req.query['status'] as string;
      }
      
      if (req.query['creatorId']) {
        filters['creatorId'] = req.query['creatorId'] as string;
      }
      
      if (req.query['limit']) {
        filters['limit'] = parseInt(req.query['limit'] as string);
      }
      
      if (req.query['offset']) {
        filters['offset'] = parseInt(req.query['offset'] as string);
      }
      
      if (req.query['sortBy']) {
        const sortBy = req.query['sortBy'] as string;
        if (sortBy === 'createTms' || sortBy === 'resolutionTime') {
          filters['sortBy'] = sortBy;
        }
      }
      
      if (req.query['sortOrder']) {
        const sortOrder = req.query['sortOrder'] as string;
        if (sortOrder === 'asc' || sortOrder === 'desc') {
          filters['sortOrder'] = sortOrder;
        }
      }

      // Execute use case
      const result = await this.getMarketsUseCase.execute(filters);

      // Convert to DTO and return response
      const response: MarketListResponseDto = marketListToDto(result);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching markets:', error);
      
      const errorResponse: MarketErrorResponseDto = {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * @swagger
   * /v1/api/markets/{market_id}:
   *   get:
   *     summary: Get market by ID
   *     description: Returns a market by its ID.
   *     tags:
   *       - Markets
   *     parameters:
   *       - in: path
   *         name: market_id
   *         required: true
   *         schema:
   *           type: string
   *         description: The market ID
   *     responses:
   *       200:
   *         description: Market found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MarketResponseDto'
   *       400:
   *         description: Market ID is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MarketErrorResponseDto'
   *       404:
   *         description: Market not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MarketErrorResponseDto'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MarketErrorResponseDto'
   */
  async getMarketById(req: Request, res: Response): Promise<void> {
    try {
      const { market_id } = req.params;

      // Validate market ID
      if (!market_id) {
        const errorResponse: MarketErrorResponseDto = {
          error: 'Market ID is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Execute use case
      const result = await this.getMarketByIdUseCase.execute(market_id);

      // Convert to DTO and return response
      const response: MarketResponseDto = marketToDto(result);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching market by ID:', error);
      
      if (error instanceof NotFoundError) {
        const errorResponse: MarketErrorResponseDto = {
          error: 'Market not found',
          message: error.message
        };
        res.status(404).json(errorResponse);
        return;
      }
      
      const errorResponse: MarketErrorResponseDto = {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      
      res.status(500).json(errorResponse);
    }
  }
} 