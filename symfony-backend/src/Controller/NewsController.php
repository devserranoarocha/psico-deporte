<?php

namespace App\Controller;

use App\Entity\News;
use App\Repository\NewsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/news', name: 'api_news_')]
final class NewsController extends AbstractController
{
    private $entityManager;
    private $repository;

    public function __construct(EntityManagerInterface $entityManager, NewsRepository $repository)
    {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
    }

    /**
     * GET /api/news
     * Endpoint público para mostrar las noticias en la web.
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $news = $this->repository->findBy([], ['date' => 'DESC']);
        
        // Mapeamos para asegurar el formato de la fecha al devolver JSON
        $data = array_map(function(News $item) {
            return [
                'id' => $item->getId(),
                'date' => $item->getDate()->format('Y-m-d'),
                'news_text' => $item->getNewsText(),
            ];
        }, $news);

        return $this->json($data);
    }

    /**
     * POST /api/news
     * Crear una nueva noticia (Protegido).
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['news_text'])) {
            return $this->json(['error' => 'El texto de la noticia es obligatorio'], Response::HTTP_BAD_REQUEST);
        }

        $news = new News();
        // Si no viene fecha, usamos la actual
        $date = isset($data['date']) ? new \DateTime($data['date']) : new \DateTime();
        
        $news->setDate($date);
        $news->setNewsText($data['news_text']);

        $this->entityManager->persist($news);
        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia creada con éxito'], Response::HTTP_CREATED);
    }

    /**
     * PUT /api/news/{id}
     * Editar una noticia existente (Protegido).
     */
    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, News $news): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['news_text'])) {
            $news->setNewsText($data['news_text']);
        }

        if (isset($data['date'])) {
            $news->setDate(new \DateTime($data['date']));
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia actualizada correctamente']);
    }

    /**
     * DELETE /api/news/{id}
     * Eliminar una noticia (Protegido).
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(News $news): JsonResponse
    {
        $this->entityManager->remove($news);
        $this->entityManager->flush();

        return $this->json(['message' => 'Noticia eliminada']);
    }
}